import * as net from "net";

// You can use print statements as follows for debugging, they'll be visible when running tests.
const store = new Map<string, { value: string, expiresAt: number | null }>();
console.log("Logs from your program will appear here!");
const noOfOccurences = (str: string, findstr: string): number => {
    const idx = str.indexOf(findstr)
    let count = 0
    while (idx !== -1) {
        count++
        str.indexOf(findstr, idx + findstr.length)
    }
    return count
}

// Uncomment this block to pass the first stage
const server: net.Server = net.createServer((connection: net.Socket) => {
    // Handle connection
    connection.on("data", (data: Buffer) => {
        // console.log(`receieved data: ${data.toString()}`)
        // console.log(`data received ${data}`)
        // console.log(`data converted to string ${data.toString()}`)
        // connection.write("+PONG\r\n")
        //operations to be performed on data
        //data variable will contain the command
        //$ redis-cli SET foo bar px 100 
        //if this is the command then data is SET foo bar px 100
        let command: string = data.toString()
        if (command.includes("PING")) {
            connection.write("+PONG\r\n")
        }
        //$<length>\r\n<data>\r\n
        if (command.includes("ECHO")) {
            const args = data.toString().split('\r\n');
            //converts the string to array 
            const txt = args[4];
            connection.write(`$${txt.length}\r\n${txt}\r\n`);
            //"*2\r\n$4\r\nECHO\r\n$6\r\nbanana\r\n"
        }
        if (command.includes("SET")) {
            const tostring: string = data.toString();
            const removedspaces: string[] = tostring.split("\r\n");
            //*3\r\n$3\r\nSET\r\n$3\r\nkey\r\n$5\r\nvalue\r\n
            const key: string = removedspaces[4];
            const value: string = removedspaces[6];
            //map has set and get methods
            // connection.write(`+OK\r\n`);
            let expiresAt: number | null = null;
            if (command.includes("px")) {
                const dtostring: string = data.toString();
                const modified: string[] = dtostring.split("\r\n");
                const pxIndex: number = modified.indexOf("px");
                const timediffinstring: string = modified[pxIndex + 2];
                //time period is in milliseconds
                const timediff: number | null = parseInt(timediffinstring);
                expiresAt = Date.now() + timediff;
            }
            store.set(key, { value, expiresAt });
            connection.write(`+OK\r\n`);
        }
        if (command.includes("GET")) {
            const commandarr: string[] = command.split("\r\n");
            const key: string = commandarr[4];
            const entry = store.get(key);
            if (entry) {
                if (entry.expiresAt === null || entry.expiresAt > Date.now()) {
                    connection.write(`$${entry.value.length}\r\n${entry.value}\r\n`);
                }
                else {
                    //it gets expired delete
                    store.delete(key);
                    connection.write("$-1\r\n");
                }

            }
            else {
                connection.write("$-1\r\n");
            }

        }
    })
});
server.listen(6379, "127.0.0.1");
