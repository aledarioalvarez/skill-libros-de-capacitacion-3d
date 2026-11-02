// Modelo de procesos sin dependencias. La visualización se construye por separado.
export function createProcessModel({ initial, nodes }) {
  if (!nodes || typeof nodes !== 'object' || Array.isArray(nodes)) throw new Error('Se requiere un mapa de nodos.');
  const graph = JSON.parse(JSON.stringify(nodes));
  const owns = id => Object.prototype.hasOwnProperty.call(graph, id);
  if (!owns(initial)) throw new Error('Estado inicial inexistente.');
  for (const node of Object.values(graph)) {
    if (!node || typeof node.label !== 'string' || !node.label.trim() || !Array.isArray(node.edges)) throw new Error('Nodo sin etiqueta o transiciones.');
    const destinations = new Set();
    for (const edge of node.edges) {
      if (!edge || typeof edge.to !== 'string' || !owns(edge.to) || typeof edge.label !== 'string' || !edge.label.trim()) throw new Error('Transición inválida.');
      if (destinations.has(edge.to)) throw new Error('Destino duplicado: usar estados distintos para consecuencias diferentes.');
      destinations.add(edge.to);
    }
  }
  let current = initial;
  let history = [];
  const snapshot = () => JSON.parse(JSON.stringify({ id: current, node: graph[current], history, terminal: graph[current].edges.length === 0, decision: graph[current].edges.length > 1 }));
  function choose(to) {
    if (!graph[current].edges.some(edge => edge.to === to)) throw new Error('Transición no permitida.');
    history.push(current);
    current = to;
    return snapshot();
  }
  return {
    snapshot,
    choose,
    step() {
      const edges = graph[current].edges;
      if (edges.length !== 1) return snapshot();
      return choose(edges[0].to);
    },
    back() {
      if (history.length) current = history.pop();
      return snapshot();
    },
    reset() { current = initial; history = []; return snapshot(); }
  };
}
