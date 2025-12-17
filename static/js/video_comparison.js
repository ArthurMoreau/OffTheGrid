// Written by Dor Verbin, October 2021
// This is based on: http://thenewcode.com/364/Interactive-Before-and-After-Video-Comparison-in-HTML5-Canvas
// With additional modifications based on: https://jsfiddle.net/7sk5k4gp/13/

Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};
    
function playVids(videoId, num_vids) {
    var videoMerge = document.getElementById(videoId + "Merge");
    var vid = document.getElementById(videoId);

    var markerPositions = new Array(5)

    for (let i = 0; i < (num_vids - 1); i++) {
        markerPositions[i] = (i + 1) / num_vids;
    }

    var vidWidth = vid.videoWidth / num_vids;
    var vidHeight = vid.videoHeight;

    var mergeContext = videoMerge.getContext("2d");

    var isDraggingIndicators = new Array(5)

    for (let i = 0; i < (num_vids - 1); i++) {
        isDraggingIndicators[i] = false;
    }

    var arrowLength = 0.09 * vidHeight;
    var arrowheadWidth = 0.025 * vidHeight;
    var arrowheadLength = 0.04 * vidHeight;
    var arrowWidth = 0.007 * vidHeight;
    var circleRadius = arrowLength * 0.7;

    var arrowYPos = new Array(5)

    for (let i = 0; i < (num_vids - 1); i++) {
        arrowYPos[i] = 0.1 + 0.8 * i / (num_vids - 2)
    }
    arrowYPos[0] = 0.5

    if (vid.readyState > 3) {
        vid.play();

        function updateNonconsecLocations(e) {

            for (let i = 0; i < (num_vids - 2); i++) {
                if (markerPositions[i] > markerPositions[i + 1]) {
                    if (isDraggingIndicators.slice(0, i + 1).some(Boolean)) {
                        markerPositions[i + 1] = markerPositions[i]
                    }
                }
            }

            for (let i = (num_vids - 2); i > 0; i--) {
                if (markerPositions[i] < markerPositions[i - 1]) {
                    if (isDraggingIndicators.slice(i, (num_vids - 1)).some(Boolean)) {
                        markerPositions[i - 1] = markerPositions[i]
                    }
                }
            }
        }

        function trackLocation(e, idx) {
            var bcr = videoMerge.getBoundingClientRect();
            var newPos = ((e.pageX - bcr.x) / bcr.width);
            markerPositions[idx] = newPos;

            if (idx < (num_vids - 2)) {
                if (markerPositions[idx] > markerPositions[idx + 1]) {
                    markerPositions[idx + 1] = markerPositions[idx]; 
                }
            }
            if (idx > 0) {
                if (markerPositions[idx] < markerPositions[idx - 1]) {
                    markerPositions[idx - 1] = markerPositions[idx]; 
                }
            }
        }

        videoMerge.addEventListener("mousedown", function(e) {
            var bcr = videoMerge.getBoundingClientRect();
            var clickPos = (e.pageX - bcr.x) / bcr.width;
            var adjustedPageY = e.pageY - window.scrollY;
            var clickPosY = (adjustedPageY - bcr.y) / bcr.height;

            for (let i = 0; i < (num_vids - 1); i++) {
                if ((Math.abs(clickPos - markerPositions[i]) <= 0.05) && (Math.abs(clickPosY - arrowYPos[i]) <= 0.05)) {
                    isDraggingIndicators[i] = true;
                    break;
                }
            }

            e.preventDefault();
            document.body.style.userSelect = "none";
        }, false);

        videoMerge.addEventListener("mousemove", function(e) {
            for (let i = 0; i < (num_vids - 1); i++) {
                if (isDraggingIndicators[i]) {
                    trackLocation(e, i);
                    break;
                }
            }
            updateNonconsecLocations();
        }, false);

        document.addEventListener("mouseup", function() {
            for (let i = 0; i < (num_vids - 1); i++) {
                isDraggingIndicators[i] = false;
            }
            document.body.style.userSelect = "";
        }, false);

        videoMerge.addEventListener("touchstart", function(e) {
            var bcr = videoMerge.getBoundingClientRect();
            var clickPos = (e.touches[0].pageX - bcr.x) / bcr.width;
            var adjustedPageY = e.pageY - window.scrollY;
            var clickPosY = (adjustedPageY - bcr.y) / bcr.height;

            for (let i = 0; i < (num_vids - 1); i++) {
                if ((Math.abs(clickPos - markerPositions[i]) <= 0.05) && (Math.abs(clickPosY - arrowYPos[i]) <= 0.05)) {
                    isDraggingIndicators[i] = true;
                    break;
                }
            }
            e.preventDefault();
            document.body.style.userSelect = "none";
        }, false);

        videoMerge.addEventListener("touchmove", function(e) {
            for (let i = 0; i < (num_vids - 1); i++) {
                if (isDraggingIndicators[i]) {
                    trackLocation(e, i);
                    break;
                }
            }
            dateNonconsecLocations();
        }, false);

        document.addEventListener("touchend", function() {
            for (let i = 0; i < (num_vids - 1); i++) {
                isDraggingIndicators[i] = false;
            }
            document.body.style.userSelect = "";
        }, false);
        
        function drawLoop() {
            mergeContext.clearRect(0, 0, vidWidth, vidHeight);

            var colStarts = new Array(num_vids);

            for (let i = 0; i < (num_vids - 1); i++) {
                colStarts[i] = (vidWidth * markerPositions[i]).clamp(0.0, vidWidth);
            }
            colStarts[num_vids - 1] = vidWidth

            mergeContext.drawImage(vid, 0, 0, vidWidth, vidHeight, 0, 0, vidWidth, vidHeight); 
            for (let i = 0; i < (num_vids - 1); i++) {
                mergeContext.drawImage(vid, colStarts[i] + vidWidth * (i + 1), 0, colStarts[i + 1] - colStarts[i], vidHeight, colStarts[i], 0, colStarts[i + 1] - colStarts[i], vidHeight);
            }

            mergeContext.beginPath();
            for (let i = 0; i < (num_vids - 1); i++) {
                mergeContext.moveTo(colStarts[i], 0); 
                mergeContext.lineTo(colStarts[i], vidHeight);
            }
            mergeContext.strokeStyle = "#AAAAAA"; 
            mergeContext.lineWidth = 5;
            mergeContext.stroke();

            for (let i = 0; i < (num_vids - 1); i++) {
                var X = vidWidth * markerPositions[i];
                var Y = arrowYPos[i] * vidHeight;

                mergeContext.beginPath();
                mergeContext.arc(X, Y, circleRadius, 0, Math.PI * 2, false);
                mergeContext.fillStyle = "#FFD79340"; 
                mergeContext.fill();
                mergeContext.closePath();

                mergeContext.beginPath();
                mergeContext.moveTo(X, Y - arrowWidth / 3);
                mergeContext.lineTo(X + arrowLength / 3 - arrowheadLength / 3, Y - arrowWidth / 3);
                mergeContext.lineTo(X + arrowLength / 3 - arrowheadLength / 3, Y - arrowheadWidth / 3);
                mergeContext.lineTo(X + arrowLength / 3, Y);
                mergeContext.lineTo(X + arrowLength / 3 - arrowheadLength / 3, Y + arrowheadWidth / 3);
                mergeContext.lineTo(X + arrowLength / 3 - arrowheadLength / 3, Y + arrowWidth / 3);
                mergeContext.lineTo(X - arrowLength / 3 + arrowheadLength / 3, Y + arrowWidth / 3);
                mergeContext.lineTo(X - arrowLength / 3 + arrowheadLength / 3, Y + arrowheadWidth / 3);
                mergeContext.lineTo(X - arrowLength / 3, Y);
                mergeContext.lineTo(X - arrowLength / 3 + arrowheadLength / 3, Y - arrowheadWidth / 3);
                mergeContext.lineTo(X - arrowLength / 3 + arrowheadLength / 3, Y);
                mergeContext.lineTo(X - arrowLength / 3 + arrowheadLength / 3, Y - arrowWidth / 3);
                mergeContext.lineTo(X, Y - arrowWidth / 3);
                mergeContext.closePath();
                mergeContext.fillStyle = "#AAAAAA";
                mergeContext.fill();
            }

            requestAnimationFrame(drawLoop);
        }

        requestAnimationFrame(drawLoop);
    }
}

function resizeAndPlay(element, num_vid) {
    var cv = document.getElementById(element.id + "Merge");
    cv.width = element.videoWidth / num_vid;
    cv.height = element.videoHeight;
    element.play();
    element.style.height = "0px";  // Hide video without stopping it
    playVids(element.id, num_vid);
}