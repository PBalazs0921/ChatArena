using Microsoft.AspNetCore.SignalR;

namespace ChatArena.Server.Hubs;

public class ChatHub : Hub
{
    public async Task JoinRoom(string roomName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
        await Clients.Group(roomName)
            .SendAsync("UserJoined", Context.ConnectionId);
    }

    public async Task SendMessage(string roomName, string user, string message)
    {
        await Clients.Group(roomName)
            .SendAsync("ReceiveMessage", user, message);
    }
    
    public async Task StartTyping(string roomName, string username)
    {
        await Clients.OthersInGroup(roomName)
            .SendAsync("UserTyping", username);
    }

    public async Task StopTyping(string roomName, string username)
    {
        await Clients.OthersInGroup(roomName)
            .SendAsync("UserStoppedTyping", username);
    }
}