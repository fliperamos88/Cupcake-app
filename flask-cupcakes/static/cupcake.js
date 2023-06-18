const BASEURL = 'http://127.0.0.1:5000/api/cupcakes';

//cupcakes list div

const cupcakesDiv = $('#all-cupcakes-div').get();

//msg to flashed on the webpage

const flashMsg = function (msg) {
  $(cupcakesDiv).append(`<h3 class=text-center>${msg}</h3>`);
  setTimeout(function () {
    $(cupcakesDiv).empty();
  }, 4000);
};

// buttons' listeners

$('#toggle-add-button').on('click', function () {
  $(cupcakesDiv).empty();
  $('#search-cupcake').hide();
  $('#new-cupcake').toggle();
  $(cupcakesDiv).addClass('show-div');
});

$('#toggle-search-button').on('click', function () {
  $(cupcakesDiv).empty();
  $('#new-cupcake').hide();
  $('#search-cupcake').toggle();
  $(cupcakesDiv).addClass('show-div');
});

$('#toggle-cupcakesList-button').on('click', async function () {
  $('#new-cupcake').hide();
  $('#search-cupcake').hide();
  if ($(cupcakesDiv).hasClass('show-div')) {
    allCupcakes();
    $(cupcakesDiv).toggleClass('show-div');
  } else {
    $(cupcakesDiv).empty();
    $(cupcakesDiv).toggleClass('show-div');
  }
});

$(document).on('click', '.edit-button', function () {
  const parent = $(this).parents().get(1);
  const saveButton = $(this).next();
  const edits = $(parent).children().find('span');
  const originalResponses = $(parent).children().find('.input-edit');
  if ($(this).hasClass('untoggled')) {
    $(this).text('Cancel');
    $(edits).toggle();
    $(originalResponses).toggle();
    $(this).toggleClass('untoggled');
    $(this).toggleClass('btn-dark');
    $(this).toggleClass('btn-danger');
    $(saveButton).show();
  } else {
    $(edits).toggle();
    $(originalResponses).toggle();
    $(this).text('Edit Cupcake');
    $(this).toggleClass('untoggled');
    $(this).toggleClass('btn-dark');
    $(this).toggleClass('btn-danger');
    $(saveButton).hide();
  }
});

// function that adds html cupcakelist to the webpage (on search cupcakes list and all cupcakes list)

const cupcakeList = function (data) {
  $(cupcakesDiv).empty();
  $(data).each(function (idx, cupcake) {
    $(cupcakesDiv).append(
      `<form class="edit-form" id="${cupcake.id}"><div class="d-flex justify-content-evenly">
        <div class="row m-3 border border-danger border-2 rounded-3 w-50">
            <div class="col"> <h4>Flavor:</h4><span id="cupcake-flavor" class="cupcake-data">${cupcake.flavor}</span>
            <input type="text" class="input-edit form-control mt-2 h-25 ms-1" style="display: none; width: 120px" value="${cupcake.flavor}"></div>
            <div class="col"> <h4>Size:</h4><span id="cupcake-size"   class="cupcake-data"> ${cupcake.size}</span>
              <select
              class="form-select input-edit mb-5 ms-3"
              aria-label="Default select example"
              required
              style="display: none; width: 90px">
                <option selected value="${cupcake.size}">${cupcake.size}</option>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
               </select>
            </div>
            <div class="col"> <h4>Rating:</h4><span  id="cupcake-rating"  class="cupcake-data">${cupcake.rating}</span>
            <input
            type="number"
            class="form-control input-edit  ms-3"
            max="10"
            min="1"
            required
            value="${cupcake.rating}"
            style="display: none; width: 65px"
            />
          </div>
          <div class="col mt-2"><img id="cupcake-image" src=${cupcake.image} class="w-75 cupcake-data"></div>
          <div class=""><input type="url" class="w-75 mb-2 ms-5 mt-2 form-control input-edit" style="display: none" placeholder="Update cupcake image"></div>
          <div class="container text-center mb-2">
            <button type="button" class="btn btn-dark edit-button untoggled" id="${cupcake.id}">
                Edit Cupcake
            </button>
            <button type="submit" class="btn btn-info save-edit-button" style="display: none">
            Save edit
            </button>
          </div>
      </div>
    </div></form>`
    );
  });
};

// GET request to get all the cupcakes in the database:

const allCupcakes = async function () {
  const { data } = await axios.get(`${BASEURL}`);
  cupcakeList(data);
};

// POST request to submit new cupcake

$('#new-cupcake').on('submit', async function (evt) {
  evt.preventDefault();
  const values = $('.cupcake-response')
    .map(function () {
      return $(this).val();
    })
    .get();
  const [flavor, size, rating, image] = values;
  if (!/^[A-Za-z]+$/.test(flavor)) {
    let msg = 'The flavor field only accepts letters';
    flashMsg(msg);
  } else {
    const addCupcake = await axios.post(`${BASEURL}`, {
      flavor,
      rating,
      size,
      image,
    });
    let msg = 'Cupcake added!';
    flashMsg(msg);
    this.reset();
  }
});

//GET resquest to search cupcakes by flavor

$('#search-cupcake').on('submit', async function (evt) {
  evt.preventDefault();
  const flavor = $('#search-flavor').val();
  if (!/^[A-Za-z]+$/.test(flavor)) {
    let msg = 'The flavor field only accepts letters';
    flashMsg(msg);
  } else {
    const { data } = await axios.get(`${BASEURL}/${flavor}`);
    cupcakeList(data);
    if (data.length == 0) {
      const msg = 'Sorry, there is no cupcake with that flavor in our database';
      flashMsg(msg);
    }
  }
  this.reset();
});

// Patch request to edit cupcakes + front-end effects

$(document).on('submit', '.edit-form', async function (evt) {
  evt.preventDefault();
  const cupcakeID = $(this).attr('id');
  const editsInputs = $(this).children().find('.input-edit');
  const values = $(this).children().find('.cupcake-data');
  const saveEditButton = $(this).children().find('.save-edit-button');
  const editButton = $(this).children().find('.edit-button');
  const cupcakeFlavor = $(this).children().find('#cupcake-flavor');
  const cupcakeSize = $(this).children().find('#cupcake-size');
  const cupcakeRating = $(this).children().find('#cupcake-rating');
  const cupcakeImage = $(this).children().find('#cupcake-image');
  $(editButton).toggleClass('untoggled');
  $(editButton).toggleClass('btn-danger');
  const allValues = $(editsInputs)
    .map(function () {
      return $(this).val();
    })
    .get();
  const [flavor, size, rating, image] = allValues;
  const { data } = await axios.patch(`${BASEURL}/${cupcakeID}`, {
    flavor,
    rating,
    size,
    image,
  });
  this.reset();
  $(cupcakeFlavor).text(data.cupcake.flavor);
  $(editsInputs[0]).val(data.cupcake.flavor);
  $(cupcakeSize).text(data.cupcake.size);
  $(editsInputs[1][0]).val(data.cupcake.size);
  $(editsInputs[1][0]).text(data.cupcake.size);
  $(cupcakeRating).text(data.cupcake.rating);
  $(editsInputs[2]).val(data.cupcake.rating);
  $(cupcakeImage).attr('src', data.cupcake.image);
  $(editsInputs).hide();
  $(saveEditButton).hide();
  $(editButton).text('Edit Cupcake');
  $(editButton).toggleClass('btn-dark');
  $(values).show();
});
