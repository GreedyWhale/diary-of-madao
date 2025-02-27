---
title: 'React Hooks'
subtitle: '哦，所以你是说你连最基本的 Hooks 都没搞明白，就敢来面试了？'
description: '终于来到了背 API 的环节，用好工具的前提一定是懂工具原理么 :-('
author: 'Caisr'
tags: ["React"]
type: 'react'
cover: '~/assets/images/interview-questions-2-banner.webp'
---

### 1. React Hooks 是什么

React Hooks 是 React 16.8 版本新增的功能，它允许你在函数组件中使用状态（state）和其他 React 特性（如生命周期、上下文等），而无需编写类组件。

### 2. 为什么需要 Hooks

1. 在组件之间复用状态逻辑很难
2. 复杂组件变得难以理解
3. 难以理解的 class

### 3. 你知道哪些 hook，简单介绍一下

1. **useState**

    创建一个变量，以及修改这个变量的方法，当变量发生变化时会触发组件重新渲染。

    需要注意的点：

    1. 如果传入的初始值是一个函数，这个函数只会在组件初始化时，调用一次，然后存储函数返回值作为初始值，但如果传入的是一个函数调用，这个函数会在组件每次渲染都被调用。

        ```tsx
        const getState = () => 1;
        const [stateA, setStateA] = React.useState(getState); // 只会调用一次 getState
        const [stateB, setStateB] = React.useState(getState()); // 每次重新渲染都会调用 getState
        ```

    2. setState 并不会立即修改 state

        ```tsx
        const [count, setCount] = React.useState(1);
    
        <button
          onClick={() => {
            setCount(count + 1);
            setCount(count + 1);
            setCount(count + 1);
          }}
        >
          +3
        </button>
        ```
    
        这样并不会让 `count + 3`，需要改为：
  
        ```tsx
        <button
          onClick={() => {
            setCount(prev => prev + 1);
            setCount(prev => prev + 1);
            setCount(prev => prev + 1);
          }}
        >
          +3
        </button>
        ```

    3. 如果 state 是引用类型的值，更新的时候需要替换而不是修改

        ```tsx
        const [formData, setFormData] = React.useState({ name: 'Allen', age: 1 });
    
        setFormData({ ...formData, age: 2 });
        ```

2. **useEffect**

    useEffect 在 React 官网的描述中有点难以理解，比如说: *处理副作用*，*用于和组件外部系统同步*之类的描述，你要理解这些描述，还要去理解什么是副作用，什么又是外部系统，解释起来很麻烦，我的理解是：

    **useEffect 是 React 完成渲染（这里的完成渲染指的是浏览器已经完成绘制）之后执行的函数。**

    那么在 useEffect 里面可以做什么？

    1. 数据的请求
    2. 获取最新的 DOM
    3. 做一些与渲染无关的操作，但是这里经常会有请求完数据然后又触发渲染的场景，我也不知道这个算不算是和渲染无关的操作。

    数据请求就可以看作是和外部系统的同步，因为请求是和服务器进行通信，不属于渲染的过程，获取最新的 DOM 就是副作用相关的操作，在 React 中渲染过程就是一次纯粹的计算，如果在渲染过程中去修改 DOM 相关的信息，那么就会导致计算过程不纯粹，更新的结果就不可预测，类似这样：

    ```javascript
    let a = 1;
    const addOne = () => {
      a = Math.random();
      return a + 1
    };

    addOne(); // 得到的结果不是确定的，这就是一个有副作用的函数
    ```
    
    useEffect 还经常被用于模拟类组件的生命周期方法，这个确实可以实现类似的效果，但是需要注意的是它和类组件的生命周期不是完全一样的，比如：

    ```jsx
    const [times, setTimes] = useState(0);

    useEffect(() => {
      setTimeout(() => console.log(`You clicked ${times} times`), 3000);
    })

    return (
      <button onClick={() => setTimes(prev => prev + 1)}>+1</button>
    )
    ```
    
    当你点击三次按钮，打印出的内容是：

    ```
    You clicked 1 times
    You clicked 2 times
    You clicked 3 times
    ```

    但是在类组件中：

    ```javascript
    componentDidUpdate() {
      setTimeout(() => {
        console.log(`You clicked ${this.state.times} times`);
      }, 3000);
    }
    ```

    会得到

    ```
    You clicked 3 times
    You clicked 3 times
    You clicked 3 times
    ```
    
    类组件通过 `this` 可以让你能随时访问到最新的 `state`，但是在 `useEffect` 中每一次重新渲染获得的都是每次渲染的值。这也说明了一点：

    > 函数组件每一次的渲染过程中 `state` 和 `props` 都是常量，保持不变

    useEffect 会根据不同的依赖行为也不同：

      1. 没有依赖的情况下组件每次渲染之后都会执行。
      
         ```javascript
          useEffect(() => { console.log('组件每次渲染之后都会执行') })
         ```
         
      2. 依赖为空数组，只会在组件首次挂载的时候执行，重新渲染的时候不会执行，但是在开发模式下会执行 2 次，这是 React 故意的行为。详情：[How to handle the Effect firing twice in development?](https://react.dev/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development)

          ```javascript
          useEffect(() => { console.log('首次挂载的时候执行') }, [])
         ```

      3. 依赖某个 state 或者 props时，会在对应的 state 或者 props 发生变化的时候执行

          ```javascript
            const [times, setTimes] = useState(0)
            useEffect(() => { console.log(times) }, [times])
          ```

    除此之外，useEffect 还支持返回一个用于清理的函数，比如：

    ```javascript
    useEffect(() => {
      const timer = setTimeout(() => console.log(`You clicked ${times} times`), 3000);

      return () => clearTimeout(timer);
    })
    ```
    
    返回的这个函数会在下一次渲染完成后执行新的 `useEffect` 之前执行。

    我的一个使用心得：最好不要把 useEffect 当作 Vue 中的 watch 使用，这样很容易写出无限循环执行的代码。


3. **useLayoutEffect**

    这个 hook 和 useEffect 类似，但是它的执行时间是在浏览器绘制之前。

    > 需要注意的是，浏览器 DOM 更新和绘制是两个步骤，DOM 更新主要指布局计算，计算完成之后再进行绘制。

    所以这个 hook 中执行的任务有可能阻塞页面的重新绘制，使用时需要注意。

    额外的知识点：

    ```javascript
    function commitPhase() {
      const demoElem = document.getElementById('demo');

      // 1. 同步更新 DOM，这会立即修改 DOM 树但是浏览器不会进行重新绘制
      demoElem.textContent = '新内容';
      demoElem.style.backgroundColor = 'lightgreen';

      // 2. 这里可以拿到最新的布局信息
      // useLayoutEffect 的执行时机类似在这里，并不是通过 requestAnimationFrame 执行的。
      const rect = demoElem.getBoundingClientRect();
      console.log('布局信息：', rect);

      // 此时，虽然 DOM 已更新，但浏览器还没有真正“绘制”到屏幕上，
      // 因为当前调用栈还未结束
    }

    commitPhase();
    // 当 JavaScript 代码执行完毕后，浏览器会在下一个事件循环中进行重绘
    ```

4. **useReducer**

    useReducer 更像是 useState 的升级版本，比较适合复杂的状态更新，比如表单数据的管理（用 use-immer 也可以）：

    ```javascript
    const [formData, setFormData] = useState({ name: '', age: 0 });

    // 更新的时候需要这样写
    setFormData(prev => ({ ...prev, age: 10 }));

    // 用 useReducer 可以这样写
    const initialState = { name: '', age: 0 };
    const reducer = (state, action) => {
      switch(action.type) {
        case 'updateName':
          return { ...state, name: action.payload }
        case 'updateAge':
          return { ...state, age: action.payload }
        default:
          return state;
      }
    }

    const [state, dispatch] = useReducer(initialState, reducer);

    // 更新
    dispatch({ type: 'updateName', payload: 'jack' });
    ```

    还有一个使用场景：当设置状态变量取决于另一个状态变量的当前值时非常适合使用 useReducer。

    比如：

    ```javascript
      const [count, setCount] = useState(0);
      const [step, setStep] = useState(1);

      useEffect(() => {
        const id = setInterval(() => {
          setCount(prev => prev + step);
        }, 1000);
        return () => clearInterval(id);
      }, [step]);
    ```

    这段代码是可以正常运行的，但是有一个问题在于 step 改变时，会触发 `clearInterval`，使用 useReducer 可以避免这种情况：

    ```javascript
    const initialState = { count: 0, step: 1 };
    const reducer = (state, action) => {
      switch(action.type) {
        case 'tick':
          return { ...state, count: state.step + state.count }
        case 'step':
          return { ...state, step: action.payload }
        default:
          return state;
      }
    }

    const [state, dispatch] = useReducer(initialState, reducer);
    useEffect(() => {
      const id = setInterval(() => {
        dispatch({ type: 'tick' })
      }, 1000);
      return () => clearInterval(id);
    }, [dispatch]);
    ```

    React 会保证 dispatch 函数在每次渲染之间稳定，你甚至可以在 useEffect 中忽略 dispatch，所以改变 step 的时候并不会触发 `clearInterval`，然后这样写还有一个非常好的地方：减少了 useEffect 的依赖项，如果你在工作中用 React 你就知道 useEffect 的依赖项很容易出现爆炸式的增长，随着依赖项越来越多 useEffect 也会变得不可控。

5. **useContext**

    useContext 用于跨组件的状态传递，尤其是嵌套过深的组件和兄弟组件之间的状态传递，如果不是一级一级传递就要用一些第三方的状态管理库，比如：React Redux、jotai、zustand，而 React Redux 以非常难用而出名，写起来很复杂。

    useContext + useReducer 可以在很大程度上代替这些第三方库。

    ```jsx
    import { createContext, useContext, useReducer } from 'react';

    const initialState = {
      id: 0,
      username: '',
    };

    const UserContext = createContext({
      userInfo: initialState,
      dispatch: (action) => {},
    });

    const reducer = (state, action) => {
      switch(action.type) {
        case 'updateUserInfo':
          return action.payload;
        default:
          return state;
      }
    };

    const useUserContext = () => React.useContext(UserContext);

    const UserContextProvider = (props) => {
      const [state, dispatch] = React.useReducer(reducer, initialState);

      return (
        <UserContext.Provider value={{ userInfo: state, dispatch }}>
          {props.children}
        </UserContext.Provider>
      );
    };

    // 在父组件中
    const Parent = () => {
      return (
        <UserContextProvider>
          <ChildOne />
          <ChildTwo />
        </UserContextProvider>
      )
    };

    // 子组件
    const ChildOne = () => {
      const { userInfo } = useUserContext();
      return (
        <div>
          <p>{userInfo.username}</p>
        </div>
      )
    };

    const ChildTwo = () => {
      const { userInfo } = useUserContext();
      return (
        <div>
          <p>{userInfo.age}</p>
        </div>
      )
    };
    ```

    这样就不用一级一级传递状态了，当 useContext 中的状态发生改变的时候，使用到这些状态的组件也会同步更新。

6. **useMemo** 和 **useCallback**

    这两个 hook 都是用于性能优化相关的，它们会缓存计算结果直到依赖发生变化，在 React 中有很多多余的渲染，比如这种情况：

    ```jsx
    const App = () => {
      const [a, setA] = useState(0);
      const [b, setB] = useState(0);

      return (
        <div>
          <p>a: {a}</p>
          <Child b={b} />
          <button onClick={() => setA(prev => prev + 1)}>Change A</button>
          <button onClick={() => setB(prev => prev + 1)}>Change B</button>
        </div>
      )
    };

    const Child = (props) => {
      console.log('render');
      return <p>b: {props.b}</p>
    };
    ```
    
    当 A 发生变化的时候，Child 组件也触发了重新渲染，但是 Child 组件并没有依赖 A，这种就属于多余的渲染，可以通过 useMemo 进行优化：

    ```jsx
    export const App = () => {
      const [a, setA] = useState(0);
      const [b, setB] = useState(0);
  
      const CachedChild = useMemo(() => <Child b={b} />, [b]);
    
      return (
        <div>
          <p>b: {a}</p>
          {CachedChild}
    
          <button onClick={() => setA(prev => prev + 1)}>Change A</button>
          <button onClick={() => setB(prev => prev + 1)}>Change B</button>
        </div>
      );
    };
    ```

    当然一般不会这样写，组件的缓存用 [memo](https://react.dev/reference/react/memo)，这里只是举一个例子。

    useMemo 是缓存一个值，useCallback 则是缓存一个函数，比如上面的例子：

    ```jsx
    export const App = () => {
      const [a, setA] = useState(0);
      const [b, setB] = useState(0);
    
      const sayName = () => console.log('app');

      return (
        <div>
          <p>a: {a}</p>
          <Child b={b} sayName={sayName} />
    
          <button onClick={() => setA(prev => prev + 1)}>Change A</button>
          <button onClick={() => setB(prev => prev + 1)}>Change B</button>
        </div>
      );
    };
    
    const Child = memo(props => {
      console.log('render');
      return <p>b: {props.b}</p>;
    });
    ```

    当传递一个函数给子组件的时候，缓存就会失效，原因就是每次重新渲染创建的函数都是新函数，用 useCallback 可以避免这种情况:

    ```jsx
    export const App = () => {
      const [a, setA] = useState(0);
      const [b, setB] = useState(0);
    
      const sayName = useCallback(() => () => console.log('app'), []);
      return (
        <div>
          <p>a: {a}</p>
          <Child b={b} sayName={sayName} />
    
          <button onClick={() => setA(prev => prev + 1)}>Change A</button>
          <button onClick={() => setB(prev => prev + 1)}>Change B</button>
        </div>
      );
    };
    ```

7. useRef

    useRef 是定义一个不会触发渲染的对象，一般用来存储 DOM 的引用或者定时器之类的值，useRef 创建的对象可以保证每次渲染都是同一个对象，修改它的值也不会触发重新渲染。

    比如说你想要保存输入框的值，但是又不想存在 state 中，因为输入框的值改变十分频繁，每次输入都 setState 的话，性能肯定会受到影响，这时候就可以放在 useRef 中。

    ```jsx
    const inputValue = useRef('');

    <input type="text" onInput={event => inputValue.current = event.target.value} />
    ```

最后还要说的几点是：

1. 不要在循环或者条件判断中使用 hooks
2. 不要在 return 语句后面使用 hooks
3. 不要在事件处理函数中使用 hooks
4. 不要在类组件中使用 hooks
5. 不要在 useMemo, useReducer 或 useEffect 的函数内调用 hooks
6. 不要在 try/catch/finally 语句中调用 hooks
