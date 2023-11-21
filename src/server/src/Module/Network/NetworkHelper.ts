import { networkInterfaces } from "os"

export class NetworkHelper {
    /**
     * 获取本机IP地址 其实就是内网ip
     * @returns 
     */
    public static getAddressIP(): string {
        let ifaces = networkInterfaces()
        
        for (let dev in ifaces) {
            let iface = ifaces[dev]

            for (let i = 0; i < iface.length; i++) {
                let { family, address, internal } = iface[i]

                if (family === 'IPv4' && address !== '127.0.0.1' && !internal) {
                    return address
                }
            }
        }
    }
}