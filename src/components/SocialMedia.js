import React, { Component } from 'react';

class SocialMedia extends Component {
    render() {
        return (
            <footer className="container">
                <div className="row">

                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-body">
                                <h4 className="card-title">You can connect with me here</h4>
                                <div>
                                    <a href="https://www.linkedin.com/in/david-de-esteban" target="_blank" rel="noreferrer noopener">
                                        <img src="LinkedInLogo.svg" alt="LinkedIn Logo"></img>
                                    </a>
                                    <a href="https://github.com/Vandenynas" target="_blank" rel="noreferrer noopener">
                                    <img src="GitHubLogo.svg" alt="GitHub Logo"></img>
                                    </a>
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        );
    }
}

export default (SocialMedia);