//消息框弹出函数
function showMessage(text, type = 'info') {
    window.parent.postMessage({
        type: 'showMessage',
        text: text,
        messageType: type
    }, '*');
}

// 页面导航函数
function navigateTo(page) {
    window.parent.postMessage({
        type: 'navigate',
        page: page
    }, '*');
}