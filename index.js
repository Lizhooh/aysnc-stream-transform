
const stream = require('stream');
const { default: isAsyncFunc } = require('is-async-function-x')

class MyStream extends stream.Transform {
  /**
   * @param{Object} options
   * @param{Function} userTransform
   */
  constructor(...args) {
    super();
    let options = {}
    let userTransform = e => e
    if (args.length === 1) {
      options = {}
      userTransform = args[0]
    }
    if (args.length === 2) {
      options = args[0]
      userTransform = args[1]
    }

    this.limit = options.limit || 3
    this.queue = []
    this.index = 0
    this.userTransform = userTransform
    this.encoding = 'buffer'
  }

  // 实现串行的批量读流
  _task(done) {
    const arr = this.queue.slice()
    const batch = Math.ceil(this.index / this.limit) - 1
    // 如果是异步函数，就用 promise 进行异步等待
    if (isAsyncFunc(this.userTransform)) {
      this.userTransform(arr, batch, this.encoding).then(() => {
        this.queue = []
        done()
      })
    }
    else {
      this.queue = []
      done()
    }
  }

  _transform(chunk, encoding, done) {
    this.index += 1
    this.queue.push(chunk.toString())
    this.push(chunk, encoding)
    this.encoding = encoding
    // 批次终点
    if (this.index % this.limit === 0) {
      this._task(done)
    }
    else {
      done()
    }
  }

  _flush(done) {
    this._task(done)
  }
}

const rs = new MyStream(async (chunk, index) => {
  console.log('第', index, '批', chunk)
  await new Promise(rs => setTimeout(rs, 1000))
});

for (let i = 0; i < 16; i++) {
  rs.write(String.fromCharCode('A'.charCodeAt() + i))
}

rs.end()

