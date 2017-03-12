import React from 'react';
import ReactDOM from 'react-dom';
//import $ from "jquery";
import gears from './imgs/gears.svg';
import ApiClient from './api/rest';
import './App.css';

var api = ApiClient('https://jsonplaceholder.typicode.com/posts');

class FilterField extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    };

    render() {
        return <input className="form-control filter-field" type="text" placeholder={this.props.name}
                      onChange={this.handleChange}></input>
    };

    handleChange(event) {
        let me = this;
        let value = event.target.value;
        let grid = me.props.target;
        let filters;
        if (grid.props.filters) {
            filters = grid.props.filters;
            let filterName = me.props.name;
            filters[filterName].value = value;
            api.filter(filters, function (xhr) {
                let data = JSON.parse(xhr.responseText);
                grid.setState({items: data});
            });
        }
    };
}

class PagerButton extends React.Component {
    constructor(props) {
        super(props);
        this.handlePaging = this.handlePaging.bind(this);
    }

    render() {
        return <button className="btn" onClick={this.handlePaging}>{this.props.title}</button>
    };

    handlePaging(event) {
        event.preventDefault();
        let me = this;
        let grid = me.props.target;
        api.paging(me.props.page, function (xhr) {
            let links = xhr.getResponseHeader('link').split(', ');
            let data = JSON.parse(xhr.responseText);
            grid.setState({items: data, pager_links: links});
        });
    };
}

class GridPager extends React.Component {
    render() {
        let me = this;
        if (me.props.target.state.pager_links) {
            let buttons = [];
            let links = me.props.target.state.pager_links;
            for (var i = 0; i < links.length; i++) {
                let link = links[i];
                let config = {};
                let title;
                config.page = link.match(/_page=([0-9]+)/)[1];
                config.limit = link.match(/_limit=([0-9]+)/)[1];
                title = link.match(/; rel="(.*)"/)[1];
                buttons.push(<PagerButton key={i} target={me.props.target} title={title} page={config}/>);
            }
            return <nav className="navbar navbar-toggleable-md navbar-light bg-faded">
                <form className="form-inline">
                    {buttons}
                </form>
            </nav>
        }
        return <div></div>
    };

    componentDidMount() {
        let me = this;
        let grid = me.props.target;
        api.paging(grid.props.paging, function (xhr) {
            let links = xhr.getResponseHeader('link').split(', ');
            let data = JSON.parse(xhr.responseText);
            grid.setState({items: data, pager_links: links});
        });
    };
}

class ModalForm extends React.Component {
    constructor(props) {
        super(props);
        this.closeForm = this.closeForm.bind(this);
        this.submitForm = this.submitForm.bind(this);
    }

    render() {
        return (<div className="modal fade in" style={{display: 'block'}} id={this.props.item_id}>
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{this.props.title}</h5>
                        <button type="button" className="close" onClick={this.closeForm}>
                            <span>&times;</span>
                        </button>
                    </div>
                    <form className="modal-body" onSubmit={this.submitForm}>
                        {this.props.fields}
                        <div className="modal-footer">
                            <button type="submit" className="btn btn-primary">Save</button>
                            <button type="button" className="btn btn-secondary" onClick={this.closeForm}>Close</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>)
    }

    closeForm(event) {
        let me = this;
        let id = me.props.item_id;
        document.getElementById(id).remove();
    }

    submitForm(event) {
        event.preventDefault();
        let changed = this.props.changed;
        if (Object.keys(changed).length > 1) {
            api.update(changed, function (xhr) {
                console.log(xhr);
            });
        }
    }
}

class PostsGridRow extends React.Component {
    constructor(props) {
        super(props);
        this.editRow = this.editRow.bind(this);
    }

    render() {
        return <tr onDoubleClick={this.editRow}>
            <th scope="row">{this.props.item.id}</th>
            <td>{this.props.item.userId}</td>
            <td>{this.props.item.title}</td>
            <td>{this.props.item.body}</td>
        </tr>
    }

    editRow(event) {
        let me = this;
        let item = me.props.item;
        let id = 'post_' + item.id;
        let form, titleField, bodyTextarea;
        form = React.createElement(ModalForm, {
            item_id: id,
            fields: [],
            title: 'Edit post #' + me.props.item.id,
            changed: {
                id: item.id
            }
        });

        function compare(event) {
            let name = event.target.name,
                value = event.target.value;

            if (value !== event.target.defaultValue) {
                form.props.changed[name] = value;
            }
            else {
                delete form.props.changed[name];
            }
        }

        titleField = <div className="form-group" key="title">
            <label htmlFor="title">Title:</label>
            <input className="form-control" type="text" id="title" name="title" onChange={compare}
                   defaultValue={item.title}></input>
        </div>;
        bodyTextarea = <div className="form-group" key="body">
            <label htmlFor="body">Body:</label>
            <textarea className="form-control" id="body" name="body" onChange={compare}
                      defaultValue={item.body}></textarea>
        </div>;
        form.props.fields.push(titleField, bodyTextarea);
        ReactDOM.render(form, document.getElementById('modal_forms'));
    }
}

class PostsGrid extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: null,
            sorter: null,
            pager_links: null
        };
        this.handleSort = this.handleSort.bind(this);
    };

    render() {
        let me = this;
        if (me.state.items) {
            let rows = [];
            me.state.items.forEach(function (item) {
                rows.push(<PostsGridRow key={item.id} item={item}/>)
            });
            return (
                <div>
                    <nav className="navbar navbar-toggleable-md navbar-light bg-faded">
                        <form className="form-inline">
                            <FilterField target={me} name="title"/>
                            <FilterField target={me} name="body"/>
                        </form>
                    </nav>
                    <table className="table table-bordered table-striped table-hover">
                        <thead className="thead-default">
                        <tr>
                            <th width="60px">id<i className="fa fa-fw fa-sort" onClick={this.handleSort} name="id"></i>
                            </th>
                            <th width="60px">userId</th>
                            <th>title<i className="fa fa-fw fa-sort" onClick={this.handleSort} name="title"></i></th>
                            <th>body</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows}
                        </tbody>
                    </table>
                    <GridPager target={me}/>
                    <div id="modal_forms"></div>
                </div>
            );
        }
        return (<div className="boot-logo"><img src={gears} alt=""/></div>)
    };

    componentDidMount() {
        let me = this;
        api.getAll(function (xhr) {
            let data = JSON.parse(xhr.responseText);
            me.setState({items: data});
        });
    };

    handleSort(event) {
        let grid = this;
        if (!grid.props.sorter.column) {
            grid.props.sorter['column'] = {
                [event.target.getAttribute("name")]: 'ASC'
            };
        }
        else {
            (grid.props.sorter.column[event.target.getAttribute("name")] === 'ASC') ? (grid.props.sorter.column = {
                    [event.target.getAttribute("name")]: 'DESC'
                }) : (grid.props.sorter.column = {
                    [event.target.getAttribute("name")]: 'ASC'
                })
        }
        api.sorter(grid.props.sorter.column, function (xhr) {
            let data = JSON.parse(xhr.responseText);
            grid.setState({
                items: data
            });
        });
    }
}

export default PostsGrid;
