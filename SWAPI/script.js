import {Person} from './personclass.js';
import axios from 'axios';

let currentPage = 1;
let peopleData = [];
const container = document.querySelector('.container');
const nextButton = document.getElementById('next');
const prevButton = document.getElementById('prev');
const errBtn = document.getElementById('errBtn');
const errDiv = document.getElementById('error-info');
let saveLastPage;

async function getPeople(id) {
    try {
        const response = await axios.get(`https://swapi.dev/api/people/${id}/`);
        return response.data;
    } catch (error) {
        console.log(error.response.status);
        console.log(error.response.data.detail);
        throw error;
    }
}

async function addPersonData(page) {
    if (!peopleData[page]) {
        const startIndex = (page - 1) * 10 + 1;
        const endIndex = startIndex + 10;
        const pagePeopleData = [];
        for (let i = startIndex; i <= endIndex; i++) {
            try {
                const people = await getPeople(i);
                const homeworldData = await getHomeworld(people.homeworld);
                const person = new Person(people.name, people.height, homeworldData.name);
                pagePeopleData.push(person);    
            } catch (error) {
                showPopup('Status:  ' + error.response.status + ' Message: ' + error.response.data.detail);
       }

    }
    peopleData[page] = pagePeopleData;
    }
};

async function renderPersonData(page) {
    await addPersonData(page);
    const startIndex = (page - 1) * 10;
    const endIndex = startIndex + 9;
    for (let i = startIndex; i <= endIndex; i++) {
        if (peopleData[page] && peopleData[page][i - startIndex]) {
            createHtmlElements(peopleData[page][i - startIndex].name, peopleData[page][i - startIndex].height, peopleData[page][i - startIndex].homeworld);
        }
    }
}

function getHomeworld(url) {
    return axios.get(url)
        .then(res => res.data);
}

function createHtmlElement(tagName, textContent) {
    const element = document.createElement(tagName);
    element.classList.add('text');
    element.textContent = textContent;
    return element;
}
function showPopup(text){
    errDiv.style.display = 'block';
    errDiv.innerHTML= text;
    setTimeout(() => {
        errDiv.style.display = 'none';
        errDiv.innerHTML= '';
    }, 3000);
}
function createHtmlElements(name, height, homeworld){
    
    const peopleTileDiv = document.createElement('div');
    peopleTileDiv.classList.add('people-tile');
    peopleTileDiv.appendChild(createHtmlElement('h1', `Name: ${name}`));
    peopleTileDiv.appendChild(createHtmlElement('h1', `Height: ${height}`));
    peopleTileDiv.appendChild(createHtmlElement('h1', `Homeworld: ${homeworld}`));

    container.appendChild(peopleTileDiv);
}

function saveLastVisitedPage() {
    localStorage.setItem('lastVisitedPage', currentPage);
}

function showPrevButton() {
    if(currentPage > 1 || saveLastPage > 1) {
        prevButton.style.display = 'block';
    } else {
        prevButton.style.display = 'none';
    }
}

nextButton.addEventListener('click', () => {
    currentPage += 1;
    container.innerHTML = '';
    renderPersonData(currentPage);
    showPrevButton();
});

prevButton.addEventListener('click', () => {
    currentPage -= 1;
    container.innerHTML = '';
    renderPersonData(currentPage);
    showPrevButton();
});

errBtn.addEventListener('click', () => {
    currentPage = 999;
    container.innerHTML = '';
    renderPersonData(currentPage);
});

function restorePageState() {
    saveLastPage = localStorage.getItem('lastVisitedPage');
    renderPersonData(saveLastPage);
    showPrevButton();
}

window.addEventListener('beforeunload', saveLastVisitedPage);
window.addEventListener('DOMContentLoaded', function(event) {
    showPrevButton();
    if (window.localStorage) {
        restorePageState();
    } else {
        renderPersonData(currentPage);
    }  
})