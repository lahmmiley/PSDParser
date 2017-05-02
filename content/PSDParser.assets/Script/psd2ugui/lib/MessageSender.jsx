function MessageSender()
{
    this.socket = new Socket();
}

MessageSender.prototype.sendMessage = function(content)
{
    if(this.socket.open("127.0.0.1:2000") == true)
    {
        this.socket.write(content);
        this.socket.close();
    }
}
