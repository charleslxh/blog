#!/Users/Charles/.nvm/versions/node/v8.12.0/bin/node

const fs = require('fs');
const readline = require('readline');
const https = require('https');
const pathUtils = require('path');

const args = process.argv;

if (!args[2] || !fs.existsSync(args[2])) {
  throw new Error('文件名不存在');
  process.exit(1);
}

const targetFileName = args[2];
const pattern = /^\!\[(.*)\]\((https?.+)\)$/;

const parseContentDisposition = function (contentDisposition) {
  dispositions = contentDisposition.split(/\;\s*/g);

  const data = {};
  data.type = dispositions.shift();
  data.string = contentDisposition;
  data.encode = 'utf8';

  let filenamePlusIndex = contentDisposition.indexOf('filename*=');

  if (filenamePlusIndex > -1) {
    filenamePlusIndex += 'filename*='.length;
    const endIndex = contentDisposition.indexOf(';', filenamePlusIndex);
    const disposition = contentDisposition.substring(filenamePlusIndex, endIndex > -1 ? endIndex : undefined);
    const params = disposition.split('\' \'');

    data.encode = params[0];
    data.filename = params[1];
  } else {
    let filenameIndex = contentDisposition.indexOf('filename=');
    if (filenameIndex > -1) {
      filenameIndex += 'filename='.length;
      const endIndex = contentDisposition.indexOf(';', filenameIndex);
      data.filename = contentDisposition.substring(filenameIndex, endIndex > -1 ? endIndex : undefined);
    }
  }

  return data;
}

const downloadImage = function(url, done) {
  https.get(url, (res) => {
    if (res.statusCode === 200) {
      const contentDisposition = parseContentDisposition(res.headers['content-disposition']);

      if (!contentDisposition.filename) {
        contentDisposition.filename = url.split('/').pop();
      }

      const length = parseInt(res.headers['content-length']);
      const path = pathUtils.resolve(process.cwd(), 'source/uploads/posts/git-flow/' , contentDisposition.filename);

      console.log(`正在下载 ${ url }，总大小为：${ length }B`)

      const stream = fs.createWriteStream(path, { encoding: contentDisposition.encode });

      console.log(`    下载完成：${ path }`);
      console.log('\n');

      res.pipe(stream);

      res.on('end', () => done && done());
    }
  });
}

const rl = readline.createInterface({
  input: fs.createReadStream(targetFileName, { encoding: 'utf8' }),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  line = line.trim();
  const matches = line.match(pattern);

  if (matches && matches[2]) {
    downloadImage(matches[2]);
  }
});

rl.on('close', () => {
  console.log('已读取完毕');
});
