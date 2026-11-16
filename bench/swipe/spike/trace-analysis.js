window.__log = [];
D$.analysis = {
  getField(id, base, prop, result) { if (base === location) __log.push(['getField', prop, result]); },
  invokeFun(id, f, base, args, result) { __log.push(['call', f && f.name, [...args].map(String), String(result)]); },
  condition(id, op, value) { __log.push(['cond', op, value]); },
};
