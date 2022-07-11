let itemList = [];
const host = 'http://localhost:8000';
const hdrs = {
  'Content-Type': 'application/json;charset=utf-8',
      'Access-Control-Allow-Origin': '*'
};

window.onload = async () => {
  try {
    const resp = await fetch(`${host}/allItems`, {
      method: 'GET'
    });
    const result = await resp.json();
    itemList = result;
  }
  catch {
    alert('cant get all items');
  }

  render();
}

const render = () => {
  const list = document.getElementById('list-with-costs');
  if (list === null) {
    alert('no list');
  } 

  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }

  const total = document.getElementById('total-sum');
  total.innerText = 0;

  itemList.forEach((item, index) => {
    const { _id, where, when, cost } = item;
    const itemSum = /[0-9]+/;

    const container = document.createElement('div');
    const writeWhere = document.createElement('p');
    const writeWhen = document.createElement('p');
    const sum = document.createElement('p');
    // const editButton = document.createElement('button');
    // const deleteButton = document.createElement('button');
    // const editImg = document.createElement('img');
    // const deleteImg = document.createElement('img');

    list.appendChild(container);
    
    container.appendChild(writeWhere);

    container.appendChild(writeWhen);
    container.appendChild(sum);
    // container.appendChild(editButton);
    // container.appendChild(deleteButton);

    // editButton.appendChild(editImg);
    // deleteButton.appendChild(deleteImg);

    container.id = `container-${_id}`;
    container.className = 'list__container';

    [writeWhere.innerText, writeWhen.innerText, sum.innerText] = [`${index + 1}) ${where}`, when, `${cost} р.`];
    [writeWhere.className, writeWhen.className, sum.className] = ['write-where', 'write-when', 'sum'];

    // editButton.className = 'list__edit';
    // deleteButton.className = 'list__delete';

    // editImg.src = 'img/edit.svg';
    // deleteImg.src = 'img/delete.svg';

    const matchedTotal = total.innerText.match(itemSum);
    let totalSum = Number(matchedTotal);
    totalSum += Number(cost);
    total.innerText = `${totalSum} р.`; 

    addButtons(_id, writeWhere.innerText, writeWhen.innerText, sum.innerText);

    // editButton.onclick = () => {
    //   editItem(_id, writeWhere.innerText, writeWhen.innerText, sum.innerText);
    // }

    // deleteButton.onclick = () => {
    //   deleteItem(_id);
    // }
  });
}

const addItem = async () => {
  const inputWhere = document.getElementById('where');
  const inputHowMuch = document.getElementById('howMuch');

  if ((inputWhere === null || inputHowMuch === null) ||
  (inputWhere.value.trim() === '' || inputHowMuch.value.trim() === '')) {
    return;
  }

  try {
    const date = new Date();
    const today = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const [day, month, year] = today.split('/');
    const now = day + "." + month + "." + year;
    
    const resp = await fetch(`${host}/newItem`, {
      method: 'POST',
      headers: hdrs,
      body: JSON.stringify({
        where: inputWhere.value,
        when: now,
        cost: inputHowMuch.value
      })
    });
    const result = await resp.json();
    itemList = result;
  }
  catch(error) {
    alert('cant add new item');
  }
  
  inputWhere.value = '';
  inputHowMuch.value = '';

  render();
}

const editItem = async (id, lastWhere, lastWhen, lastSum) => {
  const itemSum = /[0-9]+/;
  const index = /[0-9]+[)]/;

  const parent = document.getElementById(`container-${id}`);
  if (parent === null) {
    return;
  }

  const replaceWhere = document.createElement('input');
  const replaceWhen = document.createElement('input');
  const replaceCost = document.createElement('input');
  const doneButton = document.createElement('button');
  const cancelButton = document.createElement('button');
  const doneImg = document.createElement('img');
  const cancelImg = document.createElement('img');

  const buttons = parent.getElementsByTagName('button');
  const texts = parent.getElementsByTagName('p');

  const cutOffIndex = texts[0].innerText.match(index);

  replaceWhere.className = 'container__replace-where';
  replaceWhere.value = texts[0].innerText.substring(cutOffIndex[0].length, texts[0].innerText.length).trim();

  replaceWhen.className = 'container__replace-when';
  replaceWhen.value = texts[1].innerText;

  replaceCost.type = 'number';
  replaceCost.className = 'container__replace-cost';
  const matchedSum = texts[2].innerText.match(itemSum);
  replaceCost.value = texts[2].innerText.match(matchedSum[0]);

  parent.removeChild(buttons[1]);
  parent.removeChild(buttons[0]);
  parent.removeChild(texts[2]);
  parent.removeChild(texts[1]);
  parent.removeChild(texts[0]);

  doneImg.src = 'img/done.svg';
  cancelImg.src = 'img/cancel.svg';

  doneButton.appendChild(doneImg);
  cancelButton.appendChild(cancelImg);

  parent.appendChild(replaceWhere);
  parent.appendChild(replaceWhen);
  parent.appendChild(replaceCost);
  parent.appendChild(doneButton);
  parent.appendChild(cancelButton);
  
  doneButton.onclick = () => {
    doneItemEditing(id);
  }

  cancelButton.onclick = () => {
    cancelItemEditing(id, lastWhere, lastWhen, lastSum);
  }
}

const deleteItem = async (id) => {
  try {
    const resp = await fetch(`${host}/deleteItem`, {
      method: 'DELETE',
      headers: hdrs,
      body: JSON.stringify({_id: id})
    });
    const result = await resp.json();

    if (result.deletedCount !== 0) {
      itemList = itemList.filter(item => item._id !== id);
    }
  }
  catch(error) {
    alert('unable to delete task');
  }

  render();
}

const doneItemEditing = async (id) => {
  const parent = document.getElementById(`container-${id}`);
  if (parent === null) {
    return;
  }

  const itemSum = /[0-9]+/;
  const itemNewDate = /^\d{2}\.\d{2}\.\d{4}$/;

  const changedValues = parent.getElementsByTagName('input');

  const changedWhere = changedValues[0].value;
  const changedWhen = changedValues[1].value;
  const changedCost = changedValues[2].value;

  if (changedWhere.trim() === '' || changedWhen.trim() === '' || changedCost.trim() === '') {
    return;
  }

  const matchedSum = changedCost.match(itemSum);

  const [writeWhere, writeWhen, sum] = [ `${changedWhere}`, changedWhen, `${changedCost.match(matchedSum[0])}`];

  if (!changedWhen.match(itemNewDate)) {
    changedValues[1].focus();
    return;
  }

  try {
    const resp = await fetch(`${host}/editItem`, {
      method: 'PATCH',
      headers: hdrs,
      body: JSON.stringify({
        _id: id,
        where: writeWhere,
        when: writeWhen,
        cost: sum 
      })
    });
    const result = await resp.json();
    itemList = result;
  }
  catch(error) {
    alert('unable to update text');
  }

  const total = document.getElementById('total-sum');
  const matchedTotal = total.innerText.match(itemSum);
  let totalSum = Number(matchedTotal);
  totalSum += Number(changedCost);
  total.innerText = totalSum; 

  render();
}

const cancelItemEditing = (id, lastWhere, lastWhen, lastSum) => {
  const parent = document.getElementById(`container-${id}`);
  if (parent === null) {
    return;
  }

  const writeWhere = document.createElement('p');
  const writeWhen = document.createElement('p');
  const sum = document.createElement('p');
  // const editButton = document.createElement('button');
  // const deleteButton = document.createElement('button');
  // const editImg = document.createElement('img');
  // const deleteImg = document.createElement('img');

  const inputs = parent.getElementsByTagName('input');
  const buttons = parent.getElementsByTagName('button');

  [writeWhere.innerText, writeWhen.innerText, sum.innerText] = [lastWhere, lastWhen, lastSum]; 

  parent.removeChild(inputs[2]);
  parent.removeChild(inputs[1]);
  parent.removeChild(inputs[0]);
  parent.removeChild(buttons[1]);
  parent.removeChild(buttons[0]);
  

  parent.appendChild(writeWhere);
  parent.appendChild(writeWhen);
  parent.appendChild(sum);
  // parent.appendChild(editButton);
  // parent.appendChild(deleteButton);

  // editButton.appendChild(editImg);
  // deleteButton.appendChild(deleteImg);

  [writeWhere.className, writeWhen.className, sum.className] = ['write-where', 'write-when', 'sum'];

  addButtons(id, lastWhere, lastWhen, lastSum);

  // editButton.className = 'list__edit';
  // deleteButton.className = 'list__delete';

  // editImg.src = 'img/edit.svg';
  // deleteImg.src = 'img/delete.svg';

  // editButton.onclick = () => {
  //   editItem(id, lastWhere, lastWhen, lastSum);
  // }

  // deleteButton.onclick = () => {
  //   deleteItem(id);
  // }
}

const addButtons = (id, lastWhere, lastWhen, lastSum) => {
  const parent = document.getElementById(`container-${id}`);
  if (parent === null) {
    return;
  }

  const editButton = document.createElement('button');
  const deleteButton = document.createElement('button');
  const editImg = document.createElement('img');
  const deleteImg = document.createElement('img');

  parent.appendChild(editButton);
  parent.appendChild(deleteButton);
  editButton.appendChild(editImg);
  deleteButton.appendChild(deleteImg);

  editButton.className = 'list__edit';
  deleteButton.className = 'list__delete';

  editImg.src = 'img/edit.svg';
  deleteImg.src = 'img/delete.svg';

  editButton.onclick = () => {
    editItem(id, lastWhere, lastWhen, lastSum);
  }

  deleteButton.onclick = () => {
    deleteItem(id);
  }
}