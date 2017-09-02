const child_process = require('child_process');
setInterval(() => {
    child_process.exec('docker inspect mbc', (err, stdout, stderr) => {
        if(!err){
            const data = JSON.parse(stdout)[0];

            console.log(data.State.Health.Log.pop());
            console.log('------------------------------------------');
        }else{
            console.error(stderr)
        }
    })
}, 5000);