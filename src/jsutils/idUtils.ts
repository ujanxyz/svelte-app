
function newRandomId(): string {
  return Math.random().toString(36).slice(2);
}

export {newRandomId};