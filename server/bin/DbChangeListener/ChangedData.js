"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ChangedData {
    constructor(body) {
        const data = JSON.parse(body);
        this.type = data[0];
        this.schema = data[1];
        this.table = data[2];
        this.changedFields = data[3];
        this.newData = data[4];
        this.oldData = data[5];
    }
}
exports.default = ChangedData;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRiQ2hhbmdlTGlzdGVuZXIvQ2hhbmdlZERhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFTQTtJQStCSSxZQUFZLElBQVM7UUFFakIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzQixDQUFDO0NBQ0o7QUF6Q0QsOEJBeUNDIiwiZmlsZSI6IkRiQ2hhbmdlTGlzdGVuZXIvQ2hhbmdlZERhdGEuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVHJpZ2dlclR5cGUgZnJvbSBcIi4vVHJpZ2dlclR5cGVcIjtcblxuXG4vKipcbiAqIOaVsOaNruW6k+S4reWPkeeUn+WPmOWMlueahOaVsOaNrlxuICogXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgQ2hhbmdlZERhdGFcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2hhbmdlZERhdGEge1xuICAgIC8qKlxuICAgICAqIOWPkeeUn+WPmOWMlueahOexu+Wei1xuICAgICAqL1xuICAgIHJlYWRvbmx5IHR5cGU6IFRyaWdnZXJUeXBlO1xuXG4gICAgLyoqXG4gICAgICog5pWw5o2u5bqT5ZCN56ewXG4gICAgICovXG4gICAgcmVhZG9ubHkgc2NoZW1hOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiDooajlkI1cbiAgICAgKi9cbiAgICByZWFkb25seSB0YWJsZTogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICog5Y+R55Sf5pS55Y+Y55qE5a2X5q615ZCN56ewXG4gICAgICovXG4gICAgcmVhZG9ubHkgY2hhbmdlZEZpZWxkczogc3RyaW5nW107XG5cbiAgICAvKipcbiAgICAgKiDlj5HnlJ/lj5jljJbkuYvliY3nmoTpgqPkuIDooYzmlbDmja5cbiAgICAgKi9cbiAgICByZWFkb25seSBvbGREYXRhOiBhbnk7XG5cbiAgICAvKipcbiAgICAgKiDlj5HnlJ/lj5jljJbkuYvlkI7nmoTpgqPkuIDooYzmlbDmja5cbiAgICAgKi9cbiAgICByZWFkb25seSBuZXdEYXRhOiBhbnk7XG5cbiAgICBjb25zdHJ1Y3Rvcihib2R5OiBhbnkpIHtcbiAgICAgICAgLy8g6Kej5p6Q5Y+R5p2l55qE5pWw5o2uXG4gICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKGJvZHkpO1xuICAgICAgICB0aGlzLnR5cGUgPSBkYXRhWzBdO1xuICAgICAgICB0aGlzLnNjaGVtYSA9IGRhdGFbMV07XG4gICAgICAgIHRoaXMudGFibGUgPSBkYXRhWzJdO1xuICAgICAgICB0aGlzLmNoYW5nZWRGaWVsZHMgPSBkYXRhWzNdO1xuICAgICAgICB0aGlzLm5ld0RhdGEgPSBkYXRhWzRdO1xuICAgICAgICB0aGlzLm9sZERhdGEgPSBkYXRhWzVdO1xuICAgIH1cbn0iXX0=
