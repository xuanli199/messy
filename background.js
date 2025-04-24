// 监听新标签页的创建和更新
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // 当页面加载完成时
  if (changeInfo.status === 'complete') {
    // 获取存储的设置
    const result = await chrome.storage.local.get(['replaceText', 'autoReplace']);
    
    // 确保有默认值
    const autoReplace = result.autoReplace !== undefined ? result.autoReplace : true;
    const replaceText = result.replaceText || '玄离';
    
    // 保存默认设置
    await chrome.storage.local.set({
      replaceText: replaceText,
      autoReplace: autoReplace
    });
    
    // 如果启用了自动替换且有替换文本
    if (autoReplace && replaceText) {
      // 注入content script
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });
    }
  }
});

// 扩展安装时设置默认值
chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.local.set({
    replaceText: '玄离',
    autoReplace: true
  });
});