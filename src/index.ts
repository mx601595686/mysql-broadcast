import DbChangeListener from "./DbChangeListener/DbChangeListener";
import MysqlInitializer from "./MysqlInitializer/MysqlInitializer";

console.log('hello world')
let a = new DbChangeListener();
a.start().then(()=>{
    console.log('ok')
}).then(()=>(new MysqlInitializer).start());