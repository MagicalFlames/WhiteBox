// 页面加载时检查是否有注册成功的用户ID需要自动填入
window.addEventListener('DOMContentLoaded', function() {
    const registeredUserId = sessionStorage.getItem('registeredUserId');
    if (registeredUserId) {
        document.getElementById('userId').value = registeredUserId;
        showMessage('用户ID已自动填入: ' + registeredUserId, 'info');
        // 清除sessionStorage中的数据，避免重复提示
        sessionStorage.removeItem('registeredUserId');
        // 自动聚焦到密码输入框
        document.getElementById('password').focus();
    }
});

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('登录成功!','success');
            navigateTo('chat.html?userId=' + data.userId + '&username=' + data.username);
        } else {
            showMessage('登录失败: ' + data.message, 'error');
        }
    } catch (error) {
        showMessage('请检查网络连接','error');
    }
});
