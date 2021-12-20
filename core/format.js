module.exports.Format = 
{
    S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    },
    /** Каждый элемент получает уникальный идентификатор */
    getGUID(/** 'S4' - Набор из 4 цифр в 16-ой системе */map = "S4S4-S4-S4-S4-S4-S4S4S4")
    {
        return map.split("S4").reduce((prev, curr) => prev + this.S4() + curr);
    }
}