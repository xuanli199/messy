/*
 * @Author: xuanli xuanli@example.com
 * @Date: 2025-04-14 22:22:40
 * @LastEditors: xuanli xuanli@example.com
 * @LastEditTime: 2025-04-14 23:29:06
 * @FilePath: \乱码器\content.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 创建MutationObserver实例来监听DOM变化
const observer = new MutationObserver(async (mutations) => {
  const result = await chrome.storage.local.get(['replaceText', 'autoReplace']);
  if (result.autoReplace && result.replaceText) {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            replacePageText(result.replaceText, node);
          }
        }
      }
    }
  }
});

// 页面加载完成时检查是否需要自动替换文字
function handlePageLoad() {
  // 跳过chrome://和edge://等特殊协议页面
  if (window.location.protocol === 'chrome:' || window.location.protocol === 'edge:') {
    return;
  }
  
  // 立即检查存储中的设置
  chrome.storage.local.get(['replaceText', 'autoReplace'], (result) => {
    // 确保autoReplace有默认值true
    const autoReplace = result.autoReplace !== undefined ? result.autoReplace : true;
    
    // 确保replaceText有默认值
    const replaceText = result.replaceText || '玄离';
    
    // 立即保存默认设置
    chrome.storage.local.set({
      replaceText: replaceText,
      autoReplace: autoReplace
    });
    
    if (autoReplace && replaceText) {
      replacePageText(replaceText, document.body);
    }
    
    // 开始监听DOM变化
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

// 监听DOMContentLoaded和load事件
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', handlePageLoad);
} else {
  handlePageLoad();
}

// 监听storage变化
chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace === 'local') {
    const result = await chrome.storage.local.get(['autoReplace', 'replaceText']);
    const autoReplace = changes.autoReplace ? changes.autoReplace.newValue : result.autoReplace;
    const replaceText = changes.replaceText ? changes.replaceText.newValue : result.replaceText;
    
    // 如果autoReplace为true且有replaceText，执行替换
    if (autoReplace && replaceText) {
      replacePageText(replaceText, document.body);
    }
  }
});

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'replace') {
    replacePageText(request.text);
  }
});

// 替换页面文字的函数
function replacePageText(replaceText, rootNode = document.body) {
  // 获取所有文本节点
  const walker = document.createTreeWalker(
    rootNode,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let node;
  while (node = walker.nextNode()) {
    // 跳过脚本和样式标签中的文本
    if (node.parentElement.tagName === 'SCRIPT' ||
        node.parentElement.tagName === 'STYLE') {
      continue;
    }

    const originalText = node.textContent.trim();
    if (originalText) {
      // 生成替换文本
      let newText = '';
      for (let i = 0; i < originalText.length; i++) {
        // 如果原字符是空白字符，保持不变
        if (originalText[i].trim() === '') {
          newText += originalText[i];
          continue;
        }
        // 循环使用替换文本
        newText += replaceText[i % replaceText.length];
      }
      node.textContent = newText;
    }
  }
}