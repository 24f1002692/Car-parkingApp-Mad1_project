const galleryContainer = document.querySelector(".gallery-container");
const galleryControls = document.querySelector(".gallery-controls");

const controls = ["previous" , "next"];
const galleryItems = document.querySelectorAll(".gallery-item");  // images

class carousel {
    constructor(container , items , controls){
        this.carouselContainer = container;
        this.carouselControls = controls;    // previous and next
        this.carouselArray = [...items];    // images are stored in an array
    }

    updateSlider(){
        this.carouselArray.forEach((item) =>{
            item.classList.remove('gallery-item-1');    // remove the classes first
            item.classList.remove('gallery-item-2');
            item.classList.remove('gallery-item-3');
            item.classList.remove('gallery-item-4');
            item.classList.remove('gallery-item-5');
            item.classList.remove('gallery-item-6');
            item.classList.remove('gallery-item-7');
        });

        this.carouselArray.slice(0,7).forEach((el , idx) => {    // remove the class & again assigning updated class to each element...
            el.classList.add(`gallery-item-${idx + 1}`);    
        });
    }
    
    // use array methods - push, pop, shift, unshift
    setCurrentState(direction){
        if(direction.className == "gallery-controls-previous"){
            this.carouselArray.unshift(this.carouselArray.pop());     // remove the last element(image) from the array and add it to front...
        }else{
            this.carouselArray.push(this.carouselArray.shift());  // remove the first element from the array and push it to the end of array....
        }
        this.updateSlider();   // update(re-assigning) className of each element(images) of the array....
    }
    
    // set buttons first
    setControls() {
        this.carouselControls.forEach(control => {
            const button = document.createElement("button");
            button.className = `gallery-controls-${control}`;
            button.innerHTML = control === "previous"
                ? `<i class="fas fa-chevron-left"></i>`
                : `<i class="fas fa-chevron-right"></i>`;
            galleryControls.appendChild(button);
        });
    }

    
    // use Buttons
    useControls(){
        const triggers = [...galleryControls.childNodes];  // gallery-controls-previous and gallery-controls-next is stored as an array(childnodes) in triggers
        triggers.forEach((trigger) => {
            trigger.addEventListener("click" , (e) => {
                this.setCurrentState(trigger);
            });
        });
    }
}

// object of class carousel is created.
const sliderCarousel = new carousel(galleryContainer , galleryItems , controls);
sliderCarousel.setControls();
sliderCarousel.useControls();