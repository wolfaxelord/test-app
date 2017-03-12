import React from 'react';
import ReactDOM from 'react-dom';
import PostsGrid from './App';
import './index.css';

let filters = {
    title: {
        operator: '_like',
        value: ''
    },
    body: {
        operator: '_like',
        value: ''
    }
};

let paging = {
    page: 1,
    limit: 10
};

let sorter = {

};

ReactDOM.render(
    <PostsGrid filters={filters} paging={paging} sorter={sorter}/>,
    document.getElementById('root')
);
