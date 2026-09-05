const ffmpeg = require('fluent-ffmpeg');
const { PassThrough } = require('stream');
const EventEmitter = require('events');

class FFmpegService extends EventEmitter {
  constructor() {
    super();
    this.processes = new Map();
  }

  startProcess(sessionId, rtmpUrl) {
    if (this.processes.has(sessionId)) throw new Error('Process running');
    const inputStream = new PassThrough();
    const command = ffmpeg().input(inputStream).inputOptions(['-f webm', '-re'])
      .outputOptions(['-c:v libx264', '-preset veryfast', '-f flv']).output(rtmpUrl)
      .on('start', () => this.emit('start', { sessionId }))
      .on('error', (err) => { this.emit('error', { sessionId, error: err }); this.stopProcess(sessionId); })
      .on('end', () => { this.emit('end', { sessionId }); this.stopProcess(sessionId); });
    command.run();
    this.processes.set(sessionId, { command, inputStream });
    return inputStream;
  }

  feedData(sessionId, data) {
    const process = this.processes.get(sessionId);
    if (process?.inputStream) process.inputStream.write(data);
  }

  stopProcess(sessionId) {
    const process = this.processes.get(sessionId);
    if (process) {
      if (process.inputStream) process.inputStream.end();
      if (process.command) process.command.kill('SIGKILL');
      this.processes.delete(sessionId);
    }
  }
}

module.exports = new FFmpegService();
