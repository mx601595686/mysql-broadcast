import chalk = require('chalk');

//用于方便打印日志
export default {
    /**
     * Log
     * 
     * @param {...any[]} args 
     */
    l(...args: any[]) {
        console.log(chalk.gray(`[${(new Date).toLocaleTimeString()}] `), ...args);
    },
    /**
     * warning
     * 
     * @param {...any[]} args 
     */
    w(...args: any[]) {
        console.warn(chalk.gray(`[${(new Date).toLocaleTimeString()}] `), chalk.yellow(...args));
    },
    /**
     * error
     * 
     * @param {...any[]} args 
     */
    e(...args: any[]) {
        console.error(chalk.gray(`[${(new Date).toLocaleTimeString()}] `), chalk.red(...args));
    }
}