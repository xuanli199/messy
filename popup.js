// 获取DOM元素
const replaceTextInput = document.getElementById('replaceText');
const saveBtn = document.getElementById('saveBtn');
const replaceBtn = document.getElementById('replaceBtn');
const errorMsg = document.getElementById('error');
const autoReplaceCheckbox = document.getElementById('autoReplace');

// 加载保存的设置
chrome.storage.local.get(['replaceText', 'autoReplace'], (result) => {
  replaceTextInput.value = result.replaceText || '玄离';
  autoReplaceCheckbox.checked = result.autoReplace || true;
  
  // 立即保存默认设置
  chrome.storage.local.set({
    replaceText: replaceTextInput.value,
    autoReplace: autoReplaceCheckbox.checked
  });
});

// 保存设置
saveBtn.addEventListener('click', () => {
  const text = replaceTextInput.value.trim();
  if (text.length === 0 || text.length > 10) {
    errorMsg.style.display = 'block';
    return;
  }
  errorMsg.style.display = 'none';
  chrome.storage.local.set({
    replaceText: text,
    autoReplace: autoReplaceCheckbox.checked
  });
});

// 替换页面文字
replaceBtn.addEventListener('click', async () => {
  const text = replaceTextInput.value.trim();
  if (text.length === 0 || text.length > 10) {
    errorMsg.style.display = 'block';
    return;
  }
  errorMsg.style.display = 'none';
  
  // 获取当前标签页
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // 向content script发送消息
  chrome.tabs.sendMessage(tab.id, { action: 'replace', text: text });
});

// 监听自动替换开关变化
autoReplaceCheckbox.addEventListener('change', () => {
  chrome.storage.local.set({ autoReplace: autoReplaceCheckbox.checked });
});