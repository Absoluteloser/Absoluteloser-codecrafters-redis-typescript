import * as net from "net";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");
const noOfOccurences = (str: string, findstr: string):number => {
    const idx = str.indexOf(findstr)
    let count=0
    while (idx !== -1) {
        count++
        str.indexOf(findstr,idx+findstr.length)
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
    })
});
server.listen(6379, "127.0.0.1");
