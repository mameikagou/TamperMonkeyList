

/*

在 HTML 中，<code> 元素是用于定义一小段计算机代码的容器。
它通常用于包裹行内代码片段，
使其在文档中以等宽字体显示。
<code> 元素本身并不表示值，而是用于呈现代码。

就是代码块的标签

例如：

<p>示例的代码片段：<code>var x = 10;</code></p>
在这个例子中，<code> 元素包含 JavaScript 
代码片段 var x = 10;。这不是一个变量的值，
而是一个代码片段，表示将值 10 赋给变量 x。

*/

let nodes = document.querySelectorAll('div');

nodes.forEach((node) => {
    node.contentEditable = true;// 更改一个"可编辑"属性
});