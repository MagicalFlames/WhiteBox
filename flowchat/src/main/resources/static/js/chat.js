let stompClient = null;
let currentUserId = null;
let currentUsername = null;
let currentChatUserId = null;
let currentChatUsername = null;
let friends = new Map(); // 存储好友信息
let friendRequests = new Map(); // 存储好友申请信息
let contacts = new Map(); // 存储联系人信息
let currentTab = 'friends'; // 当前选中的标签页

// 从URL参数获取用户信息
const urlParams = new URLSearchParams(window.location.search);
const userIdParam = urlParams.get('userId');
const usernameParam = urlParams.get('username');

if (userIdParam && usernameParam) {
    currentUserId = userIdParam;  // 保持字符串类型
    currentUsername = usernameParam;
    document.getElementById('currentUsername').textContent = currentUsername;
    document.getElementById('currentUserId').textContent = `ID: ${currentUserId}`;
    // 设置头像文字为用户名首字母
    const avatarText = document.querySelector('.avatar-text');
    if (avatarText) {
        avatarText.textContent = currentUsername.charAt(0).toUpperCase();
    }
    autoConnect();
} else {
    showMessage('请先登录！', 'warning');
    navigateTo('login.html');
}

// 自动连接函数
function autoConnect() {
    if (!currentUserId) {
        showMessage('请先登录！', 'warning');
        navigateTo('login.html');
        return;
    }

    const socket = new SockJS('/chat');
    stompClient = Stomp.over(socket);
    
    stompClient.connect({}, function(frame) {
        console.log('Connected: ' + frame);
        
        // 订阅个人消息队列
        stompClient.subscribe('/queue/messages/' + currentUserId, function(message) {
            const chatMessage = JSON.parse(message.body);
            handleReceivedMessage(chatMessage);
        });
        
        // 更新连接状态
        document.getElementById('status').className = 'status-indicator connected';
        showMessage('已连接到聊天服务器', 'success');
        
        // 加载好友列表
        loadFriends();
        
        // 加载联系人列表
        loadContacts();
        
    }, function(error) {
        console.log('Connection error: ' + error);
        document.getElementById('status').className = 'status-indicator disconnected';
        showMessage('连接服务器失败: ' + error, 'error');
    });
}

// 处理接收到的消息
function handleReceivedMessage(chatMessage) {
    console.log('收到消息:', chatMessage);
    console.log('当前用户ID:', currentUserId);
    console.log('当前聊天用户ID:', currentChatUserId);
    
    const isFromMe = String(chatMessage.fromUserId) === String(currentUserId);
    const otherUserId = isFromMe ? chatMessage.toUserId : chatMessage.fromUserId;
    
    // 更新好友列表中的最后一条消息
    updateFriendLastMessage(otherUserId, chatMessage.content, isFromMe);
    
    // 如果正在与相关用户聊天，显示消息并清除未读计数
    if (currentChatUserId && (String(chatMessage.fromUserId) === String(currentChatUserId) || String(chatMessage.toUserId) === String(currentChatUserId))) {
        addMessageToChat(chatMessage.content, isFromMe, chatMessage.fromUserId, chatMessage.timestamp);
        // 如果是接收的消息，清除该好友的未读计数
        if (!isFromMe && friends.has(chatMessage.fromUserId)) {
            friends.get(chatMessage.fromUserId).unreadCount = 0;
            updateFriendsList();
        }
    } else {
        // 如果不是当前聊天窗口的消息，增加未读计数
        if (!isFromMe && friends.has(chatMessage.fromUserId)) {
            friends.get(chatMessage.fromUserId).unreadCount = (friends.get(chatMessage.fromUserId).unreadCount || 0) + 1;
            updateFriendsList();
            showMessage(`收到来自${friends.get(chatMessage.fromUserId).username}的新消息`, 'info');
        }
    }
}

// 获取用户信息
async function fetchUserInfo(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`);
        if (response.ok) {
            const userInfo = await response.json();
            return userInfo;
        } else {
            throw new Error('用户不存在');
        }
    } catch (error) {
        console.log('获取用户信息失败:', error);
        return {
            userId: userId,
            username: `用户${userId}`
        };
    }
}

// 切换标签页
function switchTab(tabName) {
    currentTab = tabName;
    
    // 更新标签按钮状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // 显示对应的内容
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (tabName === 'friends') {
        document.getElementById('friendsTab').classList.add('active');
        loadFriends();
    } else if (tabName === 'requests') {
        document.getElementById('requestsTab').classList.add('active');
        loadFriendRequests();
    }
}

// 搜索用户
async function searchUser() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    if (!searchTerm) {
        document.getElementById('searchResults').innerHTML = '';
        return;
    }
    
    try {
        const response = await fetch(`/api/users/search?username=${searchTerm}`);
        const users = await response.json();
        
        displaySearchResults(users);
    } catch (error) {
        showMessage('搜索失败: ' + error.message, 'error');
    }
}

// 显示搜索结果
function displaySearchResults(users) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '';
    
    users.forEach(user => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        
        // 检查是否已经是好友
        const isFriend = friends.has(String(user.userId));
        const isCurrentUser = String(user.userId) === String(currentUserId);
        
        resultItem.innerHTML = `
            <div class="search-result-info">
                <span class="search-result-name">${user.username}</span>
                <span class="search-result-id">(ID: ${user.userId})</span>
            </div>
            ${!isCurrentUser && !isFriend ? 
                `<button class="add-friend-btn" onclick="sendFriendRequest('${user.userId}', '${user.username}')">
                    加好友
                </button>` : 
                (isFriend ? '<span class="friend-status">已是好友</span>' : 
                (isCurrentUser ? '<span class="friend-status">自己</span>' : ''))
            }
        `;
        
        resultsDiv.appendChild(resultItem);
    });
}

// 添加到联系人
function addToContacts(userId, username) {
    // 确保ID为字符串类型
    const userIdStr = String(userId);
    const currentUserIdStr = String(currentUserId);
    
    if (userIdStr === currentUserIdStr) {
        showMessage('不能添加自己为联系人', 'warning');
        return;
    }
    
    // 检查是否已存在（使用字符串ID检查）
    if (contacts.has(userIdStr)) {
        const existingContact = contacts.get(userIdStr);
        showMessage(`该用户已在联系人列表中 (${existingContact.username})`, 'info');
        selectContact(userIdStr, existingContact.username);
        return;
    }
    
    // 检查是否有相同用户ID的联系人（防止ID相同但类型不同的情况）
    for (let [contactId, contact] of contacts.entries()) {
        if (String(contactId) === userIdStr) {
            showMessage(`该用户已存在: ${contact.username}`, 'info');
            selectContact(contactId, contact.username);
            return;
        }
    }
    
    // 添加新联系人
    contacts.set(userIdStr, {
        userId: userIdStr,
        username: username,
        lastMessage: '点击开始聊天',
        lastMessageTime: new Date(),
        unreadCount: 0 // 新增未读消息计数
    });
    
    updateContactsList();
    selectContact(userIdStr, username);
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
    saveContacts(); // 保存到本地存储
    
    showMessage(`已添加 ${username} 到好友`, 'success');
}

// 发送好友申请
async function sendFriendRequest(toUserId, toUsername) {
    try {
        const response = await fetch('/api/friends/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fromUserId: currentUserId,
                toUserId: toUserId,
                message: `你好，我想加你为好友！`
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('好友申请已发送', 'success');
            // 清空搜索结果
            document.getElementById('searchInput').value = '';
            document.getElementById('searchResults').innerHTML = '';
        } else {
            showMessage('发送失败: ' + data.message, 'error');
        }
    } catch (error) {
        showMessage('发送失败: ' + error.message, 'error');
    }
}

// 加载好友列表
async function loadFriends() {
    try {
        const response = await fetch(`/api/friends/list/${currentUserId}`);
        const data = await response.json();
        
        if (data.success) {
            friends.clear();
            data.friends.forEach(friend => {
                friends.set(String(friend.userId), {
                    userId: String(friend.userId),
                    username: friend.username,
                    friendSince: friend.friendSince,
                    lastMessage: '点击开始聊天',
                    lastMessageTime: new Date(),
                    unreadCount: 0
                });
            });
            updateFriendsList();
        } else {
            showMessage('加载好友列表失败: ' + data.message, 'error');
        }
    } catch (error) {
        showMessage('加载好友列表失败: ' + error.message, 'error');
    }
}

// 更新好友列表显示
function updateFriendsList() {
    const friendsList = document.getElementById('friendsList');
    
    if (friends.size === 0) {
        friendsList.innerHTML = '<div class="no-friends">暂无好友</div>';
        return;
    }
    
    friendsList.innerHTML = '';
    
    // 按用户名字典序排序
    const sortedFriends = Array.from(friends.values()).sort((a, b) => 
        a.username.localeCompare(b.username)
    );
    
    sortedFriends.forEach(friend => {
        const friendItem = document.createElement('div');
        friendItem.className = 'friend-item';
        friendItem.onclick = () => selectFriend(friend.userId, friend.username);
        
        if (String(friend.userId) === String(currentChatUserId)) {
            friendItem.classList.add('active');
        }
        
        // 创建未读消息红点
        const unreadBadge = friend.unreadCount > 0 ? 
            `<div class="unread-badge">${friend.unreadCount > 99 ? '99+' : friend.unreadCount}</div>` : '';
        
        friendItem.innerHTML = `
            <div class="friend-info">
                <div class="friend-name">${friend.username}</div>
                <div class="friend-last-message">${friend.lastMessage}</div>
            </div>
            ${unreadBadge}
        `;
        
        friendsList.appendChild(friendItem);
    });
}

// 选择好友开始聊天
async function selectFriend(userId, username) {
    currentChatUserId = userId;
    currentChatUsername = username;
    
    // 清除该好友的未读消息计数
    if (friends.has(userId)) {
        friends.get(userId).unreadCount = 0;
    }
    
    // 更新聊天头部
    document.getElementById('chatUserName').textContent = `${username} (ID: ${userId})`;
    document.getElementById('chatStatus').textContent = '在线';
    
    // 启用输入框
    document.getElementById('messageInput').disabled = false;
    document.getElementById('sendBtn').disabled = false;
    document.getElementById('messageInput').placeholder = `给 ${username} 发消息...`;
    
    // 更新好友列表选中状态
    updateFriendsList();
    
    // 加载聊天历史
    loadChatHistory(userId);
}

// 加载好友申请列表
async function loadFriendRequests() {
    try {
        // 加载收到的申请
        const receivedResponse = await fetch(`/api/friends/requests/received/${currentUserId}`);
        const receivedData = await receivedResponse.json();
        
        // 加载发送的申请
        const sentResponse = await fetch(`/api/friends/requests/sent/${currentUserId}`);
        const sentData = await sentResponse.json();
        
        if (receivedData.success && sentData.success) {
            displayReceivedRequests(receivedData.requests);
            displaySentRequests(sentData.requests);
            
            // 更新申请数量标记
            const requestCount = receivedData.requests.length;
            const badge = document.getElementById('requestBadge');
            if (requestCount > 0) {
                badge.textContent = requestCount;
                badge.style.display = 'inline';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        showMessage('加载好友申请失败: ' + error.message, 'error');
    }
}

// 显示收到的申请
function displayReceivedRequests(requests) {
    const container = document.getElementById('receivedRequests');
    
    if (requests.length === 0) {
        container.innerHTML = '<div class="no-requests">暂无好友申请</div>';
        return;
    }
    
    container.innerHTML = '';
    
    requests.forEach(request => {
        const requestItem = document.createElement('div');
        requestItem.className = 'request-item';
        
        requestItem.innerHTML = `
            <div class="request-info">
                <div class="request-from">${request.fromUsername}</div>
                <div class="request-message">${request.message || '想要加你为好友'}</div>
                <div class="request-time">${new Date(request.createdAt).toLocaleString()}</div>
            </div>
            <div class="request-actions">
                <button class="accept-btn" onclick="handleFriendRequest(${request.id}, 'accept')">接受</button>
                <button class="reject-btn" onclick="handleFriendRequest(${request.id}, 'reject')">拒绝</button>
            </div>
        `;
        
        container.appendChild(requestItem);
    });
}

// 显示发送的申请
function displaySentRequests(requests) {
    const container = document.getElementById('sentRequests');
    
    if (requests.length === 0) {
        container.innerHTML = '<div class="no-requests">暂无发送的申请</div>';
        return;
    }
    
    container.innerHTML = '';
    
    requests.forEach(request => {
        const requestItem = document.createElement('div');
        requestItem.className = 'request-item';
        
        requestItem.innerHTML = `
            <div class="request-info">
                <div class="request-to">发送给: ${request.toUsername}</div>
                <div class="request-message">${request.message || '想要加你为好友'}</div>
                <div class="request-time">${new Date(request.createdAt).toLocaleString()}</div>
            </div>
            <div class="request-status">
                <span class="status-pending">等待回复</span>
            </div>
        `;
        
        container.appendChild(requestItem);
    });
}

// 处理好友申请
async function handleFriendRequest(requestId, action) {
    try {
        const response = await fetch(`/api/friends/request/${requestId}/${action}`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage(data.message, 'success');
            // 重新加载申请列表和好友列表
            loadFriendRequests();
            if (action === 'accept') {
                loadFriends();
            }
        } else {
            showMessage('操作失败: ' + data.message, 'error');
        }
    } catch (error) {
        showMessage('操作失败: ' + error.message, 'error');
    }
}

// 更新联系人列表显示
function updateContactsList() {
    const contactsList = document.getElementById('contactsList');
    
    if (contacts.size === 0) {
        contactsList.innerHTML = '<div class=\"no-contacts\">暂无联系人</div>';
        return;
    }
    
    contactsList.innerHTML = '';
    
    // 按最后消息时间排序
    const sortedContacts = Array.from(contacts.values()).sort((a, b) => 
        new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );
    
    sortedContacts.forEach(contact => {
        const contactItem = document.createElement('div');
        contactItem.className = 'contact-item';
        contactItem.onclick = () => selectContact(contact.userId, contact.username);
        
        if (String(contact.userId) === String(currentChatUserId)) {
            contactItem.classList.add('active');
        }
        
        // 创建未读消息红点
        const unreadBadge = contact.unreadCount > 0 ? 
            `<div class="unread-badge">${contact.unreadCount > 99 ? '99+' : contact.unreadCount}</div>` : '';
        
        contactItem.innerHTML = `
            <div class="contact-info">
                <div class="contact-name">${contact.username}</div>
                <div class="contact-last-message">${contact.lastMessage}</div>
            </div>
            ${unreadBadge}
        `;
        
        contactsList.appendChild(contactItem);
    });
}

// 选择联系人开始聊天
function selectContact(userId, username) {
    currentChatUserId = userId;
    currentChatUsername = username;
    
    // 清除该联系人的未读消息计数
    if (contacts.has(userId)) {
        contacts.get(userId).unreadCount = 0;
    }
    
    // 更新聊天头部
    document.getElementById('chatUserName').textContent = `${username} (ID: ${userId})`;
    document.getElementById('chatStatus').textContent = '在线';
    
    // 启用输入框
    document.getElementById('messageInput').disabled = false;
    document.getElementById('sendBtn').disabled = false;
    document.getElementById('messageInput').placeholder = `给 ${username} 发消息...`;
    
    // 更新联系人列表选中状态
    updateContactsList();
    
    // 加载聊天历史
    loadChatHistory(userId);
}

// 加载聊天历史
async function loadChatHistory(otherUserId) {
    try {
        const response = await fetch(`/api/chat/history?userId1=${currentUserId}&userId2=${otherUserId}`);
        const data = await response.json();
        
        if (data.success) {
            displayChatHistory(data.messages);
        } else {
            showMessage('加载聊天记录失败', 'error');
        }
    } catch (error) {
        console.log('加载聊天记录失败:', error);
        showMessage('加载聊天记录失败: ' + error.message, 'error');
        // 清空聊天区域
        document.getElementById('messages').innerHTML = '';
    }
}

// 显示聊天历史
function displayChatHistory(messages) {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '';
    
    messages.forEach(message => {
        const isFromMe = String(message.fromUserId) === String(currentUserId);
        addMessageToChat(message.content, isFromMe, message.fromUserId, message.createdAt);
    });
}

// 发送消息
async function sendMessage() {
    if (!stompClient || !stompClient.connected) {
        showMessage('未连接到服务器！', 'error');
        return;
    }
    
    if (!currentChatUserId) {
        showMessage('请先选择一个用户！', 'warning');
        return;
    }
    
    const messageContent = document.getElementById('messageInput').value.trim();
    if (!messageContent) {
        return;
    }
    
    const chatMessage = {
        fromUserId: currentUserId,
        toUserId: currentChatUserId,
        content: messageContent
    };
    
    console.log('发送消息:', chatMessage);
    stompClient.send('/app/chat/sendMessage', {}, JSON.stringify(chatMessage));
    document.getElementById('messageInput').value = '';
}

// 在聊天区域添加消息
function addMessageToChat(content, isFromMe, fromUserId, timestamp) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = isFromMe ? 'message sent' : 'message received';
    
    const time = timestamp ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
    const sender = isFromMe ? '我' : (friends.get(fromUserId)?.username || `用户${fromUserId}`);
    
    messageDiv.innerHTML = `
        <div class=\"message-info\">${sender} • ${time}</div>
        <div class=\"message-bubble\">${content}</div>
    `;
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// 更新好友的最后一条消息
function updateFriendLastMessage(userId, message, isFromMe = false) {
    console.log('更新好友最后消息:', userId, message, 'isFromMe:', isFromMe);
    if (friends.has(userId)) {
        const friend = friends.get(userId);
        friend.lastMessage = message.length > 20 ? message.substring(0, 20) + '...' : message;
        friend.lastMessageTime = new Date();
        
        updateFriendsList();
        saveFriends(); // 保存到本地存储
    } else {
        console.log('好友不存在:', userId);
    }
}



// 加载联系人列表（从本地存储或服务器）
function loadContacts() {
    // 这里可以从服务器加载联系人，暂时使用本地存储
    const savedContacts = localStorage.getItem(`contacts_${currentUserId}`);
    if (savedContacts) {
        const contactsData = JSON.parse(savedContacts);
        contactsData.forEach(contact => {
            // 确保兼容旧数据格式，添加未读计数字段
            if (contact.unreadCount === undefined) {
                contact.unreadCount = 0;
            }
            // 确保用户ID为字符串类型
            const userIdStr = String(contact.userId);
            contact.userId = userIdStr;
            contacts.set(userIdStr, contact);
        });
        
        updateContactsList();
    }
}

// 保存好友到本地存储
function saveFriends() {
    const friendsArray = Array.from(friends.values());
    localStorage.setItem(`friends_${currentUserId}`, JSON.stringify(friendsArray));
}

// 监听输入框回车事件
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// 监听搜索框回车事件
document.getElementById('searchInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchUser();
    }
});

// 保存联系人到本地存储
function saveContacts() {
    const contactsArray = Array.from(contacts.entries());
    localStorage.setItem('contacts_' + currentUserId, JSON.stringify(contactsArray));
}

// 从本地存储加载联系人
function loadContacts() {
    const savedContacts = localStorage.getItem('contacts_' + currentUserId);
    if (savedContacts) {
        const contactsArray = JSON.parse(savedContacts);
        contacts.clear();
        contactsArray.forEach(([key, value]) => {
            contacts.set(key, value);
        });
    }
}

// 选择联系人开始聊天
function selectContact(userId, username) {
    currentChatUserId = userId;
    currentChatUsername = username;
    
    // 清除该联系人的未读消息计数
    if (contacts.has(userId)) {
        contacts.get(userId).unreadCount = 0;
    }
    
    // 更新聊天头部
    document.getElementById('chatUserName').textContent = `${username} (ID: ${userId})`;
    document.getElementById('chatStatus').textContent = '在线';
    
    // 启用输入框
    document.getElementById('messageInput').disabled = false;
    document.getElementById('sendBtn').disabled = false;
    document.getElementById('messageInput').placeholder = `给 ${username} 发消息...`;
    
    // 更新联系人列表选中状态
    updateContactsList();
    
    // 加载聊天历史
    loadChatHistory(userId);
}

// 退出登录函数
function logout() {
    if (confirm('确认要退出登录吗？')) {
        // 断开WebSocket连接
        if (stompClient !== null) {
            stompClient.disconnect();
        }
        
        // 更新状态显示
        document.getElementById('status').className = 'status-indicator disconnected';
        showMessage('已退出登录', 'info');
        
        // 跳转到登录页面
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// 页面关闭时保存好友并断开连接
window.addEventListener('beforeunload', function() {
    saveFriends();
    saveContacts();
    if (stompClient !== null) {
        stompClient.disconnect();
    }
});