/**
 * 随机数生成器
 */
export class RandomGenerator {
    /**
     * 随机整数 [min, max]
     * @param min 
     * @param max 
     * @returns 
     */
    public static RandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    /**
     * 万分比是否触发
     * @param prob 
     * @returns 
     */
    public static isTrigger10000Prob(prob: number){
        let randNum = this.RandomInt(0, 10000)
        
        if(randNum <= prob){
            return true
        }else{
            return false
        }
    }

    /**
     * 百分比是否触发
     * @param prob 
     * @returns 
     */
    public static isTrigger100Prob(prob: number){
        let randNum = this.RandomInt(0, 100)
        
        if(randNum <= prob){
            return true
        }else{
            return false
        }
    }
}