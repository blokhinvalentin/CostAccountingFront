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

    render();
  }
  catch (error) {
    alert('cant get all items');
  }
}

const render = () => {
  const list = document.getElementById('list-with-costs');
  if (list === null) {
    return;
  } 

  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }

  const total = document.getElementById('total-sum');
  let totalSum = itemList.reduce((sum, currentSum) => sum += currentSum.cost, 0);
  total.innerText = `${totalSum} р.`; 

  itemList.forEach((item, index) => {
    const { _id, where, when, cost } = item;

    const now = moment(when).format('DD.MM.YYYY');

    const container = document.createElement('div');
    const containerInfo = document.createElement('div');
    const position = document.createElement('p');
    const whereText = document.createElement('p');
    const whenText = document.createElement('p');
    const sum = document.createElement('p');

    list.appendChild(container);
    container.appendChild(position);
    container.appendChild(whereText);
    container.appendChild(containerInfo);
    containerInfo.appendChild(whenText);
    containerInfo.appendChild(sum);

    container.id = `container-${_id}`;
    container.className = 'list__container';

    whereText.id = `where-${_id}`;
    whenText.id = `when-${_id}`;
    sum.id = `sum-${_id}`;

    containerInfo.id = `container-info-${_id}`;
    containerInfo.className = `list__container-info`;

    position.innerText = `${index + 1})`;
    whereText.innerText = where;
    whenText.innerText = now;
    sum.innerText = `${cost} p.`;

    whereText.className = 'write-where';
    whenText.className = 'write-when';
    sum.className = 'sum';

    addButtons(_id, whereText.innerText, whenText.innerText, sum.innerText);
  });
}

const addItem = async () => {
  const myCostsList = document.getElementById(`list-with-costs`);
  if (myCostsList === null) {
    return;
  }
  const inputWhere = document.getElementById('where');
  const inputHowMuch = document.getElementById('howMuch');

  if ((inputWhere === null || inputHowMuch === null) ||
  (inputWhere.value.trim() === '' || inputHowMuch.value.trim() === '')) {
    return;
  }

  try {
    const resp = await fetch(`${host}/newItem`, {
      method: 'POST',
      headers: hdrs,
      body: JSON.stringify({
        where: inputWhere.value,
        cost: Number(inputHowMuch.value)
      })
    });
    const result = await resp.json();
    itemList.push(result);

    render();
  } catch (error) {
    alert('cant add new item');
  }
  
  inputWhere.value = '';
  inputHowMuch.value = '';
}

const editItem = async (id) => {
  const myCostsList = document.getElementById(`list-with-costs`);
  if (myCostsList === null) {
    return;
  }
  const itemSum = /[0-9]+/;
  
  const container = document.getElementById(`container-${id}`);
  const containerInfo = document.getElementById(`container-info-${id}`);
  const buttons = document.getElementById(`buttons-${id}`);
  const where = document.getElementById(`where-${id}`);
  const when = document.getElementById(`when-${id}`);
  const sum = document.getElementById(`sum-${id}`);
  const editButton = document.getElementById(`edit-button-${id}`);
  const deleteButton = document.getElementById(`delete-button-${id}`);
  
  if (container === null
    || containerInfo === null
    || buttons === null
    || where === null
    || when === null
    || sum === null
    || editButton === null
    || deleteButton === null
    ) {
      return;
  }

  const replaceWhere = document.createElement('input');
  const replaceWhen = document.createElement('input');
  const replaceCost = document.createElement('input');
  const doneButton = document.createElement('button');
  const cancelButton = document.createElement('button');
  const doneImg = document.createElement('img');
  const cancelImg = document.createElement('img');

  replaceWhere.className = 'container__replace-where';
  replaceWhere.id = `replace-where-${id}`;
  replaceWhere.value = where.innerText;

  replaceWhen.type = 'date';
  replaceWhen.className = 'container__replace-when';
  replaceWhen.id = `replace-when-${id}`;

  replaceCost.type = 'number';
  replaceCost.className = 'container__replace-cost';
  replaceCost.id = `replace-cost-${id}`;
  const matchedSum = sum.innerText.match(itemSum);
  replaceCost.value = sum.innerText.match(matchedSum[0]);

  doneButton.id = `done-button-${id}`;
  cancelButton.id = `cancel-button-${id}`;

  doneImg.src = 'img/done.svg';
  cancelImg.src = 'img/cancel.svg';

  doneButton.appendChild(doneImg);
  cancelButton.appendChild(cancelImg);

  buttons.appendChild(doneButton);
  buttons.appendChild(cancelButton);

  container.replaceChild(replaceWhere, where);
  containerInfo.replaceChild(replaceWhen, when);
  containerInfo.replaceChild(replaceCost, sum);
  buttons.replaceChild(doneButton, editButton);
  buttons.replaceChild(cancelButton, deleteButton);

  doneButton.onclick = () => {
    doneItemEditing(id);
  }

  cancelButton.onclick = () => {
    cancelItemEditing(id, where.innerText, when.innerText, sum.innerText);
  }
}

const deleteItem = async (id) => {
  try {
    const myCostsList = document.getElementById(`list-with-costs`);
    if (myCostsList === null) {
      return;
    }

    const resp = await fetch(`${host}/deleteItem`, {
      method: 'DELETE',
      headers: hdrs,
      body: JSON.stringify({_id: id})
    });
    const result = await resp.json();
    
    if (result.deletedCount !== 0) {
      itemList = itemList.filter(item => item._id !== id);
    }

    render();
  } catch (error) {
    alert('unable to delete task');
  }
}

const doneItemEditing = async (id) => {
  const myCostsList = document.getElementById(`list-with-costs`);
  if (myCostsList === null) {
    return;
  } 

  const changedWhere = document.getElementById(`replace-where-${id}`);
  const changedWhen = document.getElementById(`replace-when-${id}`);
  const changedCost = document.getElementById(`replace-cost-${id}`);

  const itemSum = /[0-9]+/;

  if (changedWhere.value.trim() === ''
    || changedWhen.value.trim() === '' 
    || changedCost.value.trim() === ''
  ) {
    return;
  }

  const matchedSum = changedCost.value.match(itemSum);

  try {
    const resp = await fetch(`${host}/editItem`, {
      method: 'PATCH',
      headers: hdrs,
      body: JSON.stringify({
        _id: id,
        where: changedWhere.value,
        when: changedWhen.value,
        cost: `${changedCost.value.match(matchedSum[0])}`
      })
    });
    const result = await resp.json();
    result.when = moment(result.when).format('MM.DD.YYYY');

    for (let i = 0; i < itemList.length; i++) {
      if (itemList[i]._id === id) {
        itemList[i] = result;
      }
    }

    render();
  } catch (error) {
    alert('unable to update text');
  }
}

const cancelItemEditing = (id, lastWhere, lastWhen, lastSum) => {
  const myCostsList = document.getElementById(`list-with-costs`);
  const container = document.getElementById(`container-${id}`);
  const containerInfo = document.getElementById(`container-info-${id}`);
  const buttons = document.getElementById(`buttons-${id}`);
  const replaceWhere = document.getElementById(`replace-where-${id}`);
  const replaceWhen = document.getElementById(`replace-when-${id}`);
  const replaceCost = document.getElementById(`replace-cost-${id}`);
  
  if (myCostsList === null) {
    return;
  }

  const where = document.createElement('p');
  const when = document.createElement('p');
  const sum = document.createElement('p');

  [where.innerText, when.innerText, sum.innerText] = [lastWhere, lastWhen, lastSum]; 

  container.replaceChild(where, replaceWhere);
  containerInfo.replaceChild(when, replaceWhen);
  containerInfo.replaceChild(sum, replaceCost);
  containerInfo.removeChild(buttons);

  where.className = 'write-where';
  when.className = 'write-when';
  sum.className = 'sum';

  where.id = `where-${id}`;
  when.id = `when-${id}`;
  sum.id = `sum-${id}`;
 
  addButtons(id);
}

const addButtons = (id) => {
  const containerInfo = document.getElementById(`container-info-${id}`);
  if (parent === null) {
    return;
  }

  const buttons = document.createElement('div');

  const editButton = document.createElement('button');
  const deleteButton = document.createElement('button');
  const editImg = document.createElement('img');
  const deleteImg = document.createElement('img');

  containerInfo.appendChild(buttons);
  
  buttons.appendChild(editButton);
  buttons.appendChild(deleteButton);
  editButton.appendChild(editImg);
  deleteButton.appendChild(deleteImg);
  
  buttons.id = `buttons-${id}`;
  buttons.className = 'list__buttons';

  editButton.className = 'list__buttons-edit';
  editButton.id = `edit-button-${id}`;

  deleteButton.className = 'list__buttons-delete';
  deleteButton.id = `delete-button-${id}`;

  editImg.src = 'img/edit.svg';
  deleteImg.src = 'img/delete.svg';

  editButton.onclick = () => {
    editItem(id);
  }

  deleteButton.onclick = () => {
    deleteItem(id);
  }
}