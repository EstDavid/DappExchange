import React, { Component } from 'react';

class SocialMedia extends Component {
    render() {
        return (
            <footer className="container">
                <div className="row">
                    <div className="col-md-12">
                        <h4 className="card-title">Connect with me</h4>
                        <div>
                            <a href="https://www.linkedin.com/in/david-de-esteban" target="_blank" rel="noreferrer noopener">
                                <img src="./images/LinkedInLogo.svg" alt="LinkedIn Logo" className="filter-blue"></img>
                            </a>
                            <a href="https://github.com/Vandenynas" target="_blank" rel="noreferrer noopener">
                                <img src="./images/GitHubLogo.svg" alt="GitHub Logo" className="filter-blue"></img>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        );
    }
}

export default (SocialMedia);