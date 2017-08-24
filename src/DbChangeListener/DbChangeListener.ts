import BaseModule from "../common/BaseModule";
import koa = require('koa');

export default class DbChangeListener extends BaseModule {

    private server: koa;

    start(): Promise<void> {
        return new Promise<void>((resolve) => {
            if (this.server === undefined) {
                this.server = new koa();
                this.server.use(async ctx => {
                    debugger
                    console.log(ctx.query);
                });

                this.server.listen(3000);
                this.server.on('error', this.emit.bind(this, 'error'));
                this.server.on('listening', resolve);
            } else {
                resolve();
            }
        });
    }
}