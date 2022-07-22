let spendings = [];
const host = 'http://localhost:8000';
const headers = {
  'Content-Type': 'application/json;charset=utf-8',
  'Access-Control-Allow-Origin': '*'
};
const itemSum = /[0-9]+/;

window.onload = async () => {
  try {
    const resp = await fetch(`${host}/spendings`, {
      method: 'GET'
    });
    const result = await resp.json();
    spendings = result;
    render();
  } catch (error) {
    showError('Error: unable to get all spendings');
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
  let totalSum = spendings.reduce((sumWasted, currentSum) => sumWasted += currentSum.cost, 0);
  total.innerText = `${totalSum} р.`; 

  spendings.forEach((item, index) => {
    const { _id, place, time, cost } = item;

    const container = document.createElement('div');
    const containerInfo = document.createElement('div');
    const position = document.createElement('p');
    const placeText = document.createElement('p');
    const timeText = document.createElement('p');
    const sumWasted = document.createElement('p');

    list.appendChild(container);
    container.appendChild(position);
    container.appendChild(placeText);
    container.appendChild(containerInfo);
    containerInfo.appendChild(timeText);
    containerInfo.appendChild(sumWasted);

    container.id = `container-${_id}`;
    container.className = 'list__container';

    placeText.id = `place-${_id}`;
    timeText.id = `time-${_id}`;
    sumWasted.id = `sum-${_id}`;

    containerInfo.id = `container-info-${_id}`;
    containerInfo.className = `list__container-info`;

    position.innerText = `${index + 1})`;
    placeText.innerText = place;
    timeText.innerText = moment(time).format('DD.MM.YYYY');
    sumWasted.innerText = `${cost} p.`;

    placeText.className = 'write-place';
    timeText.className = 'write-time';
    sumWasted.className = 'sum';

    addButtons(item);
  });
}

const addSpending = async () => {
  const costsList = document.getElementById(`list-with-costs`);
  const inputWhere = document.getElementById('place');
  const inputHowMuch = document.getElementById('howMuch');

  if (costsList === null
    || inputWhere === null 
    || inputHowMuch === null
    || inputWhere.value.trim() === '' 
    || inputHowMuch.value.trim() === ''
  ) {
    return;
  }

  try {
    const resp = await fetch(`${host}/spendings`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        place: inputWhere.value,
        cost: Number(inputHowMuch.value)
      })
    });
    const result = await resp.json();
    spendings.push(result);
    render();
  } catch (error) {
    inputWhere.value = '';
    inputHowMuch.value = '';
    showError('cant add new item');
  }
  
  inputWhere.value = '';
  inputHowMuch.value = '';
}

const editSpending = async (item) => {
  const costsList = document.getElementById(`list-with-costs`);
  if (costsList === null) {
    return;
  }

  const id = item._id;
  
  const container = document.getElementById(`container-${id}`);
  const containerInfo = document.getElementById(`container-info-${id}`);
  const buttons = document.getElementById(`buttons-${id}`);
  const place = document.getElementById(`place-${id}`);
  const time = document.getElementById(`time-${id}`);
  const sumWasted = document.getElementById(`sum-${id}`);
  const editButton = document.getElementById(`edit-button-${id}`);
  const deleteButton = document.getElementById(`delete-button-${id}`);
  
  if (container === null
    || containerInfo === null
    || buttons === null
    || place === null
    || time === null
    || sumWasted === null
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

  containerInfo.id = `container-info-${id}`;

  replaceWhere.className = 'container__replace-place';
  replaceWhere.id = `replace-place-${id}`;
  replaceWhere.value = place.innerText;

  replaceWhen.type = 'date';
  replaceWhen.className = 'container__replace-time';
  replaceWhen.id = `replace-time-${id}`;

  replaceCost.type = 'number';
  replaceCost.className = 'container__replace-cost';
  replaceCost.id = `replace-cost-${id}`;
  const matchedSum = sumWasted.innerText.match(itemSum);
  replaceCost.value = sumWasted.innerText.match(matchedSum[0]);

  doneButton.id = `done-button-${id}`;
  cancelButton.id = `cancel-button-${id}`;

  doneImg.src = 'img/done.svg';
  doneImg.alt = '';

  cancelImg.src = 'img/cancel.svg';
  cancelImg.alt = '';

  doneButton.appendChild(doneImg);
  cancelButton.appendChild(cancelImg);

  buttons.appendChild(doneButton);
  buttons.appendChild(cancelButton);

  container.replaceChild(replaceWhere, place);
  containerInfo.replaceChild(replaceWhen, time);
  containerInfo.replaceChild(replaceCost, sumWasted);
  buttons.replaceChild(doneButton, editButton);
  buttons.replaceChild(cancelButton, deleteButton);

  doneButton.onclick = () => {
    doneItemEditing(id);
  }

  cancelButton.onclick = () => {
    cancelSpendingEditing(item);
  }
}

const deleteSpending = async (id) => {
  try {
    const resp = await fetch(`${host}/spendings/${id}`, {
      method: 'DELETE',
      headers: headers
    });
    const result = await resp.json();
    
    if (result.deletedCount !== 0) {
      spendings = spendings.filter(item => item._id !== id);
    }

    render();
  } catch (error) {
    showError('unable to delete task');
  }
}

const doneItemEditing = async (id) => {
  const changedWhere = document.getElementById(`replace-place-${id}`);
  const changedWhen = document.getElementById(`replace-time-${id}`);
  const changedCost = document.getElementById(`replace-cost-${id}`);

  if (changedWhere.value.trim() === ''
    || changedWhen.value.trim() === '' 
    || changedCost.value.trim() === ''
  ) {
    return;
  }

  const matchedSum = changedCost.value.match(itemSum);

  try {
    const resp = await fetch(`${host}/spendings/${id}`, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify({
        place: changedWhere.value,
        time: changedWhen.value,
        cost: Number(`${changedCost.value.match(matchedSum[0])}`)
      })
    });
    const result = await resp.json();

    for (let i = 0; i < spendings.length; i++) {
      if (spendings[i]._id === id) {
        spendings[i] = result;
        break;
      }
    }

    render();
  } catch (error) {
    showError('unable to update text');
  }
}

const cancelSpendingEditing = (item) => {
  const { _id, place, time, cost } = item;

  const container = document.getElementById(`container-${_id}`);
  const containerInfo = document.getElementById(`container-info-${_id}`);
  const buttons = document.getElementById(`buttons-${_id}`);
  const replaceWhere = document.getElementById(`replace-place-${_id}`);
  const replaceWhen = document.getElementById(`replace-time-${_id}`);
  const replaceCost = document.getElementById(`replace-cost-${_id}`);

  const placeText = document.createElement('p');
  const timeText = document.createElement('p');
  const sumWasted = document.createElement('p');

  placeText.innerText = place;
  timeText.innerText = moment(time).format('DD.MM.YYYY');
  sumWasted.innerText = `${cost} p.`;

  container.replaceChild(placeText, replaceWhere);
  containerInfo.replaceChild(timeText, replaceWhen);
  containerInfo.replaceChild(sumWasted, replaceCost);
  containerInfo.removeChild(buttons);

  placeText.className = 'write-place';
  timeText.className = 'write-time';
  sumWasted.className = 'sum';

  placeText.id = `place-${_id}`;
  timeText.id = `time-${_id}`;
  sumWasted.id = `sum-${_id}`;

  addButtons(item);
}

const addButtons = (item) => {
  const id = item._id;

  const containerInfo = document.getElementById(`container-info-${id}`);

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
  editImg.alt = '';

  deleteImg.src = 'img/delete.svg';
  deleteImg.alt = '';

  editButton.onclick = () => {
    editSpending(item);
  }

  deleteButton.onclick = () => {
    deleteSpending(id);
  }
}

const showError = (errorMessage) => {
  const errorShow = document.getElementById('error-show');
  if (errorShow === null) {
    return;
  }
  errorShow.innerText = errorMessage;
}