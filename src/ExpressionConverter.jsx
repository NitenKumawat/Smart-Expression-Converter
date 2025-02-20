import { useState } from "react";

const ExpressionConverter = () => {
  const [expression, setExpression] = useState("");
  const [expressionType, setExpressionType] = useState("");
  const [targetType, setTargetType] = useState("");
  const [converted, setConverted] = useState("");
  const [evaluated, setEvaluated] = useState(null);

  const isOperator = (char) => "+-*/^".includes(char);
  
  const precedence = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };
  const associativity = { "+": "L", "-": "L", "*": "L", "/": "L", "^": "R" };

  const identifyExpressionType = (expr) => {
    const tokens = expr.trim().split(/\s+/);
    if (isOperator(tokens[tokens.length - 1])) return "Postfix";
    if (isOperator(tokens[0])) return "Prefix";
    return "Infix";
  };

  const infixToPostfix = (expr) => {
    let output = [];
    let stack = [];
    const tokens = expr.match(/(\d+|\w+|[+\-*/^()])/g);

    tokens.forEach((token) => {
      if (!isOperator(token) && token !== "(" && token !== ")") {
        output.push(token);
      } else if (token === "(") {
        stack.push(token);
      } else if (token === ")") {
        while (stack.length && stack[stack.length - 1] !== "(") {
          output.push(stack.pop());
        }
        stack.pop();
      } else {
        while (
          stack.length &&
          isOperator(stack[stack.length - 1]) &&
          ((associativity[token] === "L" && precedence[token] <= precedence[stack[stack.length - 1]]) ||
            (associativity[token] === "R" && precedence[token] < precedence[stack[stack.length - 1]]))
        ) {
          output.push(stack.pop());
        }
        stack.push(token);
      }
    });

    while (stack.length) {
      output.push(stack.pop());
    }
    return output.join(" ");
  };

  const infixToPrefix = (expr) => {
    const reversed = expr.split("").reverse().map(char => {
      if (char === "(") return ")";
      if (char === ")") return "(";
      return char;
    }).join("");

    const postfix = infixToPostfix(reversed);
    return postfix.split(" ").reverse().join(" ");
  };

  const postfixToInfix = (expr) => {
    let stack = [];
    expr.split(" ").forEach((token) => {
      if (!isOperator(token)) {
        stack.push(token);
      } else {
        let b = stack.pop();
        let a = stack.pop();
        stack.push(`(${a} ${token} ${b})`);
      }
    });
    return stack[0];
  };

  const prefixToInfix = (expr) => {
    let stack = [];
    expr.split(" ").reverse().forEach((token) => {
      if (!isOperator(token)) {
        stack.push(token);
      } else {
        let a = stack.pop();
        let b = stack.pop();
        stack.push(`(${a} ${token} ${b})`);
      }
    });
    return stack[0];
  };

  const postfixToPrefix = (expr) => infixToPrefix(postfixToInfix(expr));
  const prefixToPostfix = (expr) => infixToPostfix(prefixToInfix(expr));

  const evaluateExpression = (expr, type) => {
    let stack = [];
    const tokens = expr.split(" ");

    if (type === "Postfix") {
      tokens.forEach((token) => {
        if (!isOperator(token)) {
          stack.push(parseFloat(token));
        } else {
          let b = stack.pop();
          let a = stack.pop();
          switch (token) {
            case "+": stack.push(a + b); break;
            case "-": stack.push(a - b); break;
            case "*": stack.push(a * b); break;
            case "/": stack.push(a / b); break;
            case "^": stack.push(Math.pow(a, b)); break;
          }
        }
      });
    } else if (type === "Prefix") {
      tokens.reverse().forEach((token) => {
        if (!isOperator(token)) {
          stack.push(parseFloat(token));
        } else {
          let a = stack.pop();
          let b = stack.pop();
          switch (token) {
            case "+": stack.push(a + b); break;
            case "-": stack.push(a - b); break;
            case "*": stack.push(a * b); break;
            case "/": stack.push(a / b); break;
            case "^": stack.push(Math.pow(a, b)); break;
          }
        }
      });
    } else {
      return eval(expr.replace(/\^/g, "**"));
    }
    
    return stack.pop();
  };

  const handleIdentify = () => {
    const type = identifyExpressionType(expression);
    setExpressionType(type);
    setTargetType("");
    setConverted("");
    setEvaluated(null);
  };

  const handleConvert = () => {
    let result = "";
    if (expressionType === "Infix" && targetType === "Postfix") result = infixToPostfix(expression);
    else if (expressionType === "Infix" && targetType === "Prefix") result = infixToPrefix(expression);
    else if (expressionType === "Postfix" && targetType === "Infix") result = postfixToInfix(expression);
    else if (expressionType === "Prefix" && targetType === "Infix") result = prefixToInfix(expression);
    else if (expressionType === "Postfix" && targetType === "Prefix") result = postfixToPrefix(expression);
    else if (expressionType === "Prefix" && targetType === "Postfix") result = prefixToPostfix(expression);
    
    setConverted(result);
    setEvaluated(evaluateExpression(result, targetType));
  };

  return (
    <div className="max-w-md h-auto w-full p-4 bg-gray-100 rounded-lg shadow-lg bg-gradient-to-tr from-green-100 to-red-200 ">
      <h2 className="text-xl font-bold mb-4">Smart Expression Converter</h2>
      <input
        type="text"
        placeholder="Enter expression"
        className="w-full p-2 border rounded-md mb-4"
        value={expression}
        onChange={(e) => setExpression(e.target.value)}
      />
      <button onClick={handleIdentify} className="w-full bg-red-500 text-white p-2 rounded-md">Identify</button>
      {expressionType && (
        <>
          <p className="mt-4 font-semibold">Identified Type: {expressionType}</p>
          <select className="w-full p-2 border rounded-md mt-2" value={targetType} onChange={(e) => setTargetType(e.target.value)}>
            <option value="">Select target type</option>
            {["Infix", "Postfix", "Prefix"].filter(t => t !== expressionType).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button onClick={handleConvert} className="w-full bg-green-500 text-white p-2 rounded-md mt-2">Convert</button>
        </>
      )}
      {converted && <p className="mt-4 font-semibold">Converted Expression: {converted}</p>}
      {evaluated !== null && <p className="mt-4 font-semibold">Evaluated Result: {evaluated}</p>}
    </div>
  );
};

export default ExpressionConverter;
