const autoCompleteConfig = {
	renderOption(movie) {
		const imgSrc = movie.Poster === 'N/A' ? '' : movie.Poster;
		return `
    <img src='${imgSrc}' />
    ${movie.Title} (${movie.Year})
    `;
	},

	inputValue(movie) {
		return movie.Title;
	},
	async fetchData(searchTerm) {
		const response = await axios.get('http://www.omdbapi.com/', {
			params: {
				apikey: '37a70fc0',
				s: searchTerm
			}
		});

		if (response.data.Error) {
			return [];
		}

		return response.data.Search;
	}
};

createAutoComplete({
	...autoCompleteConfig,
	root: document.querySelector('#left-autocomplete'),
	onOptionSelect(movie) {
		document.querySelector('.tutorial').classList.add('is-hidden');
		const left = document.querySelector('#left-summary');
		onMovieSelect(movie, left, 'left');
	}
});

createAutoComplete({
	...autoCompleteConfig,
	root: document.querySelector('#right-autocomplete'),
	onOptionSelect(movie) {
		document.querySelector('.tutorial').classList.add('is-hidden');
		const right = document.querySelector('#right-summary');
		onMovieSelect(movie, right, 'right');
	}
});

let leftMovie, rightMovie;
const onMovieSelect = async (movie, summaryElement, side) => {
	const response = await axios.get('http://www.omdbapi.com/', {
		params: {
			apikey: '37a70fc0',
			i: movie.imdbID
		}
	});

	summaryElement.innerHTML = movieTemplate(response.data);

	if (side === 'left') {
		leftMovie = response.data;
	} else {
		rightMovie = response.data;
	}

	if (leftMovie && rightMovie) {
		runComparison();
	}
};

const runComparison = () => {
	const leftSideStats = document.querySelectorAll('#left-summary .notification');
	const rightSideStats = document.querySelectorAll('#right-summary .notification');

	leftSideStats.forEach((leftStat, i) => {
		const rightStat = rightSideStats[i];
		const leftSideValue = parseInt(leftStat.getAttribute('data'));
		const rightSideValue = parseInt(rightStat.getAttribute('data'));

		if (rightSideValue > leftSideValue) {
			leftStat.classList.remove('is-primary');
			leftStat.classList.add('is-warning');
		} else {
			rightStat.classList.remove('is-primary');
			rightStat.classList.add('is-warning');
		}
	});
};

const movieTemplate = (movieDetail) => {
	const dollars = parseInt(movieDetail.BoxOffice.replace(/\$/g, '').replace(/,/g, ''));
	const metascore = parseInt(movieDetail.Metascore);
	const imdbRating = parseFloat(movieDetail.imdbRating);
	const votes = parseInt(movieDetail.imdbVotes.replace(/,/g, ''));
	const awards = movieDetail.Awards.split(' ').reduce((total, word) => {
		const val = parseInt(word);
		if (isNaN(val)) {
			return total;
		} else {
			return total + val;
		}
	}, 0);

	return `
    <article class='media'>
      <figure class='media-left'>
        <p class='image'>
          <img src='${movieDetail.Poster}' />
        </p>
      </figure>
      <div class='media-content'>
        <div class='content'>
          <h1>${movieDetail.Title}</h1>
          <h4>${movieDetail.Genre}</h4>
          <p>${movieDetail.Plot}</p>
        </div>
      </div>
    </article>

    <article data=${awards} class='notification is-primary'>
      <p class='title'>${movieDetail.Awards}</p>
      <p class='subtitle'>Awards</p>
    </article>

    <article data=${dollars} class='notification is-primary'>
      <p class='title'>${movieDetail.BoxOffice}</p>
      <p class='subtitle'>Box Office</p>
    </article>

    <article data=${metascore} class='notification is-primary'>
      <p class='title'>${movieDetail.Metascore}</p>
      <p class='subtitle'>Metascore</p>
    </article>

    <article data=${imdbRating} class='notification is-primary'>
      <p class='title'>${movieDetail.imdbRating}</p>
      <p class='subtitle'>IMDB Rating</p>
    </article>

    <article data=${votes} class='notification is-primary'>
      <p class='title'>${movieDetail.imdbVotes}</p>
      <p class='subtitle'>IMDB Votes</p>
    </article>
  `;
};
