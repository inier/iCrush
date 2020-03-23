import get from '@yelloxing/core.js/get';
import { tagToComponent, compilerText, replaceDom } from '../../helper';

// 挂载结点的任务主要有以下内容：
// 1.生成真实dom并挂载好
// 2.收集指令，过滤器和组件信息（根据全局和局部的，进行抽取和校验），在数据更新的时候启动更新
// 3.当前组件和父亲组件，包括子组件，还有事件等，在必要的时候挂载或启动，还有什么时候应该销毁等信息的登记

function mountDom(that, key, pEl, iCrush) {

    let vnode = get(that, key), el;

    if (!vnode) {
        console.error('[iCrush warn]: vnode is undefined!');
        return;
    }

    // 如果是none，需要提前分类
    if (vnode.type == 'none') {
        let ttc = tagToComponent(vnode.tagName);
        if (that.__componentLib[ttc]) {
            vnode.component = that.__componentLib[ttc];
            vnode.type = 'component';
        } else {
            vnode.type = 'tag';
        }
    }

    // 1.组件
    if (vnode.type == 'component') {
        el = document.createElement('i-crush-component');
        pEl.appendChild(el);
        vnode.component.el = el;

        // 这相当于子组件，挂载好了以后，启动即可
        vnode.instance = new iCrush(vnode.component);
        vnode.instance.__parent = that;
    }

    // 2.普通标签
    else if (vnode.type == 'tag') {

        el = document.createElement(vnode.tagName);
        if (pEl.nodeName == 'I-CRUSH-COMPONENT' || pEl._nodeName == 'I-CRUSH-COMPONENT') {

            // 作为临时占位的结点，我们应该替换而不是追加
            replaceDom(pEl, el);
            that._el = el;

        } else {
            pEl.appendChild(el);
        }

        // 挂载好父亲以后，挂载孩子
        for (let i = 0; i < vnode.children.length; i++) {
            mountDom(that, key + ".children[" + i + "]", el, iCrush);
        }
    }

    // 3.普通文本
    else if (vnode.type == 'text') {

        el = document.createTextNode(vnode.content);
        pEl.appendChild(el);

    }

    // 4.绑定文本
    else if (vnode.type == 'bindText') {

        el = document.createTextNode(compilerText(that, vnode.content));
        pEl.appendChild(el);

    }

    // 其它应该抛错
    else {
        console.error('[iCrush warn]: Type not expected：' + vnode.type);
    }

};

export default mountDom;