const fs = require('fs');

const options = {
    key:  fs.readFileSync(__dirname + '/ssh3/private.key'),
    cert: fs.readFileSync(__dirname + '/ssh3/certificate.crt'),
    ca: fs.readFileSync(__dirname + '/ssh3/request.csr'),
    passphrase: 'udpsol',
    requestCert: true,
    rejectUnauthorized: false
};

console.log(__dirname);

const app = require('https').createServer(options);

const io = require('socket.io')(app, {
    cors: {
        origin: 'https://voice2text.vercel.app',
        methods: ['GET', 'POST'],
    }
});

app.listen(8052);

const ss = require('socket.io-stream');
const path = require('path');
const fetch = require('node-fetch');
const base64 = require('base-64');

io.on('connection', (socket) => {

    const uuid = socket.handshake.query.id;
    console.log('client is connected', uuid);

    ss(socket).on(`audio_file_${uuid}`, (stream, data) => {
        // console.log(stream, data);
        const conversationName = data.conversation;

        const filename = path.basename(data.name);

        //const dir = `/Users/thanhnguyen/Desktop/${conversationName}`;
        const dir = `../../../asr/repository/korean/${conversationName}`;

        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        stream.pipe(fs.createWriteStream(`${dir}/${filename}`));

        const body_data = {
            "file_name": `${conversationName}/${filename}`,
            "language": "ko"
        };

        fetch('http://183.96.253.147:8080/api/services/asr/transcription', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${base64.encode('twindoc:twindoc')}`
            },
            body: JSON.stringify(body_data)
        }).then(res => res.json())
        .then(data =>{
            console.log('transcription_', uuid);
            socket.emit(`transcription_${uuid}`, data);
        })
    });
});

module.exports = io;