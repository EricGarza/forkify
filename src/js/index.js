import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import { elements, renderLoader, clearLoader } from './views/base';

/** Global state of the app
 *  - Search object
 *  - Current recipe object
 *  - Shopping list object
 *  - Liked recipes
 */
const state = { };

const controlSearch = async () => {
  const query = searchView.getInput();

  if (query) {
    state.search = new Search(query);
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);    

    try {
      await state.search.getResults();
      searchView.renderResults(state.search.result);
    } catch (error) {
      alert('Something went wrong');
    }
    
    clearLoader();
  }
}

elements.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
  const btn = e.target.closest('.btn-inline');

  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});

const controlRecipe = async () => {
  const id = window.location.hash.replace('#', '');

  if (id) {
    recipeView.clearRecipe();
    renderLoader(elements.recipe);
    if (state.search) searchView.highlightSelected(id);
    state.recipe = new Recipe(id);

    try {
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();
      state.recipe.calcTime();
      state.recipe.calcServings();

      clearLoader();
      recipeView.renderRecipe(state.recipe);
    } catch (error) {
      alert('Error processing recipe!');
    }
  }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
  // match element that has css class of .btn-decrease or any child that does
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
    }
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
    state.recipe.updateServings('inc');
  }

  recipeView.updateServingsIngredients(state.recipe);
});