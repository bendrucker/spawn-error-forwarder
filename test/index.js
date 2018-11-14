'use strict'

/* global describe, it, beforeEach */

var fwd = require('../')
var EventEmitter = require('events').EventEmitter
var expect = require('chai').expect

describe('spawn-error-forwarder', function () {
  var child
  beforeEach(function () {
    child = new EventEmitter()
    child.stdout = new EventEmitter()
    child.stderr = new EventEmitter()
  })

  it('forwards stderr output to a stdout stream error', function (done) {
    fwd(child)
    child.stderr.emit('data', Buffer.from('part 1'))
    child.stderr.emit('data', Buffer.from('part 2'))
    child.stdout.on('error', function (err) {
      expect(err.message).to.equal('part 1part 2')
      done()
    })
    child.emit('close', 1)
  })

  it('ignores 0 exit codes', function () {
    fwd(child)
    child.stdout.on('error', function () {
      throw new Error()
    })
    child.emit('close', 0)
  })

  it('can create custom errors', function (done) {
    fwd(child, function (code, stderr) {
      return new Error(code + stderr)
    })
    child.stderr.emit('data', Buffer.from('stderr'))
    child.stdout.on('error', function (err) {
      expect(err.message).to.equal('1stderr')
      done()
    })
    child.emit('close', 1)
  })
})
