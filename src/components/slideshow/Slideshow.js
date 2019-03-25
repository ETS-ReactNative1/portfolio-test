import  React from 'react';
import { TweenMax, Power3, Power4 } from 'gsap';

import '../slideshow/Slideshow.css';
import Slide from '../slides/Slide';
import debounce from '../utils/debounce';
import projectsAPI from '../../api';
import BackgroundText from '../backgroundText/BackgroundText';


let colors = [
    // Grey
   ['#B6B39C', '#ea2f3c', '#cd5d63'],
   // Black
   ['#21201d','#b6b39c','#b6b39c'],
   // Yellow
   ['#e7c986','#FEFEFE','#0e1f2c'],
   // orange
   ['#f7b47c','#eb272d','#fefefe'],
   // white
   ['#e6e7e9','#eb1020','#eb1020'],
   // blue
   ['#7bc4d3','#fef4f2','#030603']
];
class Slideshow extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      current: 0,
      exiting: false
    }

    this.DOM = {
      backgroundDesc: React.createRef()
    };

  }

  componentDidMount() {

    console.log(
      this.props
    );


    // this.DOM = {};
    // this.DOM.container = document.querySelector('#gallery__container');
    // this.DOM.backgroundDesc = document.querySelector('.background__description');

    // this.DOM.backgroundTitles = [];

    this.slides = [];
    document.querySelectorAll('.slide').forEach((slideEl, i) => this.slides.push(new Slide(slideEl, i)));

    window.addEventListener('resize', () => debounce(this.setPos(), 10));
    this.slidesTotal = this.slides.length;
    this.isAnimating = false;

    this.setPos();
    this.init();

    // Intro animations
    // this.showBackgroundText();

    setTimeout(() => {
      this.showSlides();
    }, 2500);

  }

  componentDidUpdate() {
    if (this.state.exting === true) {
      this.hideSlides();
      this.hideBackgroundText();
    }
  }

  // initBackgroundText() {
  //   document.querySelectorAll('.background__reveal').forEach((title, i) => {
  //     if(i < 2){
  //       this.DOM.backgroundTitles.push(title)
  //     } else
  //     {
  //       if(i === 2) { this.DOM.backgroundTitles.push([]); }
  //       this.DOM.backgroundTitles[2].push(title);
  //     }
  //   });
  // }

  // showBackgroundText() {
  //   this.initBackgroundText();

  //   TweenMax.set(this.DOM.backgroundTitles[0], {
  //     left: '10%'
  //   })

  //   TweenMax.set(this.DOM.backgroundTitles[1], {
  //     right: '10%'
  //   })

  //   TweenMax.set(this.DOM.backgroundTitles[2], {
  //     left: '10%'
  //   })

  //   TweenMax.staggerTo(this.DOM.backgroundTitles, 2.5, {
  //     ease: Power3.easeInOut,
  //     right: 0,
  //     left: 0,
  //     opacity: 1
  //   }, 0.05);

  //   setTimeout(() => {
  //     TweenMax.fromTo(this.DOM.backgroundDesc.current, 1,
  //       {
  //         opacity: 0,
  //         ease: Power4.easeInOut,
  //         top: 100
  //       },{
  //       opacity: 1,
  //       top:0
  //     })
  //   }, 2000);
  // }

hideBackgroundText() {
   TweenMax.to(this.DOM.backgroundTitles, 2,
    {
      ease: Power4.easeInOut,
      top: -180
    }, 0.1);

    TweenMax.to(this.DOM.backgroundDesc.current, 2,
      {
        ease: Power4.easeInOut,
        top: -180
      }, 0.1);
  }


  init() {
    this.clickFn = (slide) => {
      if ( slide.isPositionedRight() ) {
        this.navigate('next');
      }
      else if ( slide.isPositionedLeft() ) {
        this.navigate('prev');
      }
      else if (slide.isPositionedCenter()) {
        this.setState({ exting: true });
        this.props.history.push(`/site/${slide.index}`);
      }
    };
    for (let slide of this.slides) {
      slide.DOM.imgWrap.addEventListener('click', () => {
        this.clickFn(slide);
      });
    }
  }

  updateSlides() {
    this.nextOutView2 = this.slides[this.state.current + 3];
    this.nextOutView = this.slides[this.state.current +2];
    this.nextSlide = this.slides[this.state.current +1];
    this.currentSlide = this.slides[this.state.current];
    this.prevSlide = this.slides[this.state.current -1];
    this.prevOutView = this.slides[this.state.current -2];
    this.prevOutView2 = this.slides[this.state.current -3];
  }

  setPos() {
    this.updateSlides();
    this.currentSlide.setCurrent()
    if (this.nextSlide) this.nextSlide.setRight();
    if (this.nextOutView) this.nextOutView.setRightOutView();
    if (this.nextOutView2) this.nextOutView2.setRightOutView();
    if (this.prevSlide) this.prevSlide.setLeft();
    if (this.prevOutView) this.prevOutView.setLeftOutView();
    if (this.prevOutView2) this.prevOutView2.setLeftOutView();
  }

  // Navigate the slideshow.
  navigate(direction) {
    // If animating return.
    if ( !this.isAnimating ) {
      this.isAnimating = true;

      const upcomingPos = direction === 'next' ? this.state.current + 1 : this.state.current - 1;
      this.upcomingSlide = this.slides[upcomingPos];

      // Move previous slide to current or out of view left
      if (this.prevSlide) {
        this.prevSlide.moveToPosition({ position: direction === 'next' ? -2 : 0 });
      }

      // Slide next slide to current or out of view right
      if (this.nextSlide) {
        this.nextSlide.moveToPosition({ position: direction === 'next' ? 0 : 2 });
      };

      // Slide into view right
      if (this.nextOutView) {
        this.nextOutView.moveToPosition({ position: direction === 'next' ? 1 : 2 });
      }

      // Slide into view left
      if (this.prevOutView) {
        this.prevOutView.moveToPosition({ position: direction === 'next' ? -2 : -1 });
      }

      // Slide current slide forwards or backwards
      this.currentSlide.hideTitle();
      this.currentSlide.moveToPosition({ position: direction === 'next' ? -1 : 1 }).then(() => {
        this.isAnimating = false;
        this.setPos();
      });

      // Update Current`
      this.setState({ current: direction === 'next' ? this.state.current+1 : this.state.current-1 });

      this.updateSlides();
      this.currentSlide.showTitle();
    }
  }

  showSlides() {
    this.slides.forEach((slide, i) => {
      setTimeout(() => {
        slide.fadeIn();
      }, i * 100);
      this.currentSlide.showTitle();
    });
  }

  coverSlides() {
    this.currentSlide.cover();
    if (this.prevSlide) setTimeout(() => this.prevSlide.cover(), 200);
    if (this.nextSlide) setTimeout(() => this.nextSlide.cover(), 400);
  }

  hideSlides() {
    if ( !this.isAnimating ) {
      this.isAnimating = true;
      this.coverSlides();
      this.currentSlide.hideTitleUp();
    }
  }

  render() {
    return(
      <div id="gallery__container">
        {/* <div className="
          background__hide-text
          background__line-1">
          <h1 className="background__title background__reveal">Street. Street</h1>
        </div>
        <div className="
        background__hide-text
        background__line-2">
          <h1 className="background__title background__reveal">se. Wise. Wise</h1>
        </div>
        <div className="
        background__hide-text
        background__line-3">
          <h1 className="background__title background__reveal">Studios.</h1>
          <p ref={this.DOM.backgroundDesc} className="background__description">I'm Maloclm Gourdine. A Digital designer & fullstack Web development. Based in Brooklyn New York</p>
          <h1  className="background__title background__reveal">Studio.</h1>
        </div> */}

        <BackgroundText/>


        <div id="slideshow">
          {projectsAPI.projects.map((project, i) =>
            <div key={i} className={`slide slide${i}`}>
              <div className="overlay">
                <div>
                  <img src={require(`../../assets/img/${project.img}`) } className="slide__img" alt="slide"/>
                </div>
              </div>

              <div className="title__container">
                <div className="hide__text">
                  <h3 className={`slide__title slide__title${i}`}>
                    Alex
                  </h3>
                </div>

                <div className="hide__text">
                  <h3 className={`slide__title slide__title${i}`}>
                  Brindis
                  </h3>
                </div>

                <div className="hide__text">
                  <h3 className={`slide__title slide__title${i}`}>
                  Design.
                  </h3>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <p className="navigation name">Malcolm Gourdine</p>
          <p className="navigation bracket-1">［</p>
          <p className="navigation contact"> Contact</p>
          <p className="navigation bracket-2">］</p>

          <p className="navigation location">KY <br/> BN</p>

        </div>
      </div>
    );
  }
}
export default Slideshow;