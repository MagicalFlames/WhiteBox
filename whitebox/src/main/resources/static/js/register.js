document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const inviteCode = document.getElementById('inviteCode').value;
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password,
                inviteCode: inviteCode
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('注册成功! 您的用户ID是: ' + data.userId, 'success');
            sessionStorage.setItem('registeredUserId', data.userId);
            navigateTo('login.html');
        } else {
            showMessage('注册失败: ' + data.message, 'error');
        }
    } catch (error) {
        showMessage('请检查网络连接','error');
    }
});
