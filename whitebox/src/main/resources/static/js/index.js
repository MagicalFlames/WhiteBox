// 全局弹出框函数
window.showMessage = function(text, type = 'info') {
    const container = document.getElementById('toast-container');
    
    // 创建弹出框
    const toast = document.createElement('div');
    toast.textContent = text;
    toast.style.cssText = `
        margin: 10px 20px;
        padding: 12px 16px;
        background: ${getMessageColor(type)};
        color: white;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        font-size: 14px;
        max-width: 280px;
        word-wrap: break-word;
        pointer-events: auto;
        transform: translateX(100%);
        transition: transform 0.3s ease-out;
    `;
    
    container.appendChild(toast);
    
    // 动画显示
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    // 3秒后自动移除
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
};

// 获取消息颜色
function getMessageColor(type) {
    switch(type) {
        case 'success': return '#28a745';
        case 'error': return '#dc3545';
        case 'warning': return '#ffc107';
        default: return '#6f42c1';
    }
}

// 页面导航函数
window.navigateTo = function(page) {
    const iframe = document.getElementById('page-content');
    const loading = document.getElementById('loading');
    
    loading.style.display = 'block';
    iframe.style.opacity = '0.5';
    
    iframe.onload = function() {
        loading.style.display = 'none';
        iframe.style.opacity = '1';
    };
    
    iframe.src = page;
};

// 监听iframe内的消息
window.addEventListener('message', function(event) {
    if (event.data.type === 'showMessage') {
        window.showMessage(event.data.text, event.data.messageType);
    } else if (event.data.type === 'navigate') {
        window.navigateTo(event.data.page);
    }
});
