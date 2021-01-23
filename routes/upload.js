const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const base64 = require('base-64');

const formidable = require('formidable');

router.post('/file', (req, res, next) => {
    const form = formidable({ multiples: true });

    form.parse(req, (err, fields, files) => {
      console.log(fields, files);
      if (err) {
        next(err);
        return;
      }

      const name = fields.name;
      const file = files.file;

      const data = fs.readFileSync(file.path);
      fs.writeFileSync(path.resolve('./') + '/' + name + '.wav', data);
      fs.unlinkSync(file.path);

      const body_data = {
        "file_name": `${name}.wav`,
        // "language": "ko"
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
        console.log('transcription_', data);
        res.json({ data });
      }).catch(ex => res.json({ex}));

    });
});

module.exports = router;