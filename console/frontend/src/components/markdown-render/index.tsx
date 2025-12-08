import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { v4 as uuid } from 'uuid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import customFootnotePlugin from './custom-footnote-plugin';
import ReactECharts from 'echarts-for-react';
import { isJSON } from '@/utils';

function MarkdownRender({ content, isSending = false }): React.ReactElement {
  const globalMarkdownId = uuid();
  
  // 预处理内容：确保代码块标记前后有正确的换行
  // 解决后端可能在超链接后直接拼接```echarts的问题
  let processedContent = String(content);
  
  // 检测内容是否包含ECharts图表
  const hasECharts = /```echarts/.test(processedContent);
  
  // 调试：输出原始内容
  console.log('Original content:', processedContent);
  console.log('Has ECharts:', hasECharts);
  
  // 处理代码块格式问题
  // - 移除```与echarts之间的空格
  processedContent = processedContent.replace(/```\s+(echarts)/g, '```$1');
  // - 处理echarts在新行的情况（如```\necharts）
  processedContent = processedContent.replace(/```\n\s*echarts/g, '```echarts\n');
  
  // 2. 确保在所有```前面有一个换行符（处理普通代码块）
  processedContent = processedContent.replace(/([^\n])(```)/g, '$1\n$2');
  
  // 3. 确保在所有```后面有一个换行符
  processedContent = processedContent.replace(/(```)([^\n])/g, '$1\n$2');
  
  // 4. 修复ECharts代码块的特殊格式问题：
  // - 处理```后面有空格的情况（如``` echarts）
  // - 处理echarts在新行的情况（如```\necharts）
  processedContent = processedContent.replace(/```\s*\n\s*echarts\s*/g, '```echarts\n');
  processedContent = processedContent.replace(/```\s*echarts\s*/g, '```echarts\n');
  
  // 调试：输出处理后的内容
  console.log('Processed content:', processedContent);

  function addCursorToLastElement(): void {
    // 清除之前的光标类
    const container = document.getElementById(globalMarkdownId);
    const mdContainer = container?.querySelector('.global-markdown');
    const previousCursor = mdContainer?.querySelector(
      '.global-markdown-flashing-cursor'
    );
    if (previousCursor) {
      previousCursor.classList.remove('global-markdown-flashing-cursor');
    }

    // 获取最后一个子元素
    const lastElement = getLastDeepestChild(mdContainer);

    if (lastElement) {
      lastElement.classList.add('global-markdown-flashing-cursor');
    }
  }
  function getLastDeepestChild(element): unknown {
    while (element?.lastElementChild) {
      element = element?.lastElementChild;
      if (element?.textContent?.trim()) {
        return element;
      }
    }
    return element;
  }

  function clearCursorToLastElement(): void {
    const container = document.getElementById(globalMarkdownId);
    const previousCursor = container?.querySelectorAll(
      '.global-markdown-flashing-cursor'
    );
    if (previousCursor) {
      Array.from(previousCursor).forEach(function (element) {
        element.classList.remove('global-markdown-flashing-cursor');
      });
    }
  }

  useEffect(() => {
    if (isSending) {
      addCursorToLastElement();
    } else {
      clearCursorToLastElement();
    }
  }, [content, isSending]);

  const MyLink = ({ href, children }): React.ReactElement => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );

  const ImageRenderer = ({ src, alt }): React.ReactElement => (
    <img src={src} alt={alt} style={{ maxWidth: '100%' }} />
  );

  // 作用域化样式函数
  const scopeStyles = (styles, scopeClass): string => {
    // 添加作用域类到每个样式规则
    return styles.replace(
      /([^{]+)\{([^}]*)\}/g,
      (match, selectors, stylesBlock) => {
        // 处理每个选择器：为每个选择器添加作用域类，但排除@开头的规则（如媒体查询）
        if (selectors.trim().startsWith('@')) {
          return match; // 媒体查询
        }

        const scopedSelectors = selectors
          .split(',')
          .map(selector => {
            const trimmed = selector.trim();
            // 选择器是:root或html/body等，特殊处理
            if (
              trimmed === ':root' ||
              trimmed === 'html' ||
              trimmed === 'body'
            ) {
              return `[data-${globalMarkdownId}]`;
            }
            return `.${scopeClass} ${trimmed}`;
          })
          .join(', ');

        return `${scopedSelectors} {${stylesBlock}}`;
      }
    );
  };

  const ScopedStyle = (props: unknown): React.ReactElement => {
    const { children, node, ...rest } = props;
    // 从style标签中获取样式内容
    const styleContent = Array.isArray(children)
      ? children.join('')
      : children || '';
    // 添加作用域
    const scopedStyles = scopeStyles(styleContent, 'markdown-body');

    return <style {...rest}>{scopedStyles}</style>;
  };

  return (
    <div
      id={globalMarkdownId}
      className="flex items-center justify-center markdown-body"
    >
      <ReactMarkdown
        skipHtml={false}
        className="global-markdown"
        remarkPlugins={[
          remarkMath,
          remarkGfm
        ]}
        rehypePlugins={[
          rehypeRaw,
          rehypeKatex,
          customFootnotePlugin,
        ]}
        components={{
          a: MyLink,
          image: ImageRenderer,
          code(props) {
            const { children, className, node, ...rest } = props;

            const match = /language-(\w+)/.exec(className || '');
            if (match && match[1] === 'echarts' && children) {
              // 处理ECharts图表
              let option = null;
              let codeContent = String(children).trim();
              
              // 添加调试信息，记录原始内容
              console.log('Original ECharts Content:', codeContent);
              console.log('Content Type:', typeof codeContent);
              
              try {
                // 尝试解析策略：
                // 1. 首先尝试直接解析原始内容
                if (isJSON(codeContent)) {
                  console.log('Direct JSON Parse Success');
                  option = JSON.parse(codeContent);
                } else {
                  // 2. 如果直接解析失败，尝试处理转义字符
                  let processedContent = codeContent;
                  
                  // 处理转义的引号（考虑多层转义）
                  while (processedContent.includes('\\\\"')) {
                    processedContent = processedContent.replace(/\\\\"/g, '\\"');
                  }
                  processedContent = processedContent.replace(/\\"/g, '"');
                  
                  // 处理转义的换行符和制表符
                  processedContent = processedContent.replace(/\\n/g, '\n');
                  processedContent = processedContent.replace(/\\t/g, '\t');
                  
                  console.log('Processed Content:', processedContent);
                  
                  // 3. 尝试解析处理后的内容
                  if (isJSON(processedContent)) {
                    console.log('Processed JSON Parse Success');
                    option = JSON.parse(processedContent);
                  } else {
                    // 4. 如果还是失败，尝试eval解析
                    console.log('Trying eval with processed content');
                    
                    // 使用eval解析
                    // eslint-disable-next-line no-eval
                    option = eval(`(${processedContent})`);
                    console.log('Eval Success');
                  }
                }
              } catch (error) {
                console.error('解析ECharts配置失败:', error);
                console.error('原始代码内容:', String(children).trim());
                return (
                  <div className="echarts-error">
                    <p>图表配置解析失败: {error.message}</p>
                    <pre>{error.stack}</pre>
                  </div>
                );
              }

              if (option) {
                // console.log('Rendering ECharts with option:', option);
                // console.log('ECharts container style:', { height: '400px', margin: '16px 0', width: '100%', maxWidth: '960px', display: 'block' });
                return (
                  <div className="echarts-container" style={{ height: '400px', margin: '16px 0', width: '100%', maxWidth: '960px', display: 'block' }}>
                    <ReactECharts option={option} style={{ minWidth: '50vw', height: '100%', maxWidth: '960px' }} />
                  </div>
                );
              }
            }
            
            // 处理其他代码块
            return match && children ? (
              <SyntaxHighlighter
                {...rest}
                PreTag="div"
                children={String(children)}
                language={match[1]}
                style={github}
              />
            ) : (
              <code {...rest} className={className}>
                {children}
              </code>
            );
          },
          style: ScopedStyle,
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownRender;
