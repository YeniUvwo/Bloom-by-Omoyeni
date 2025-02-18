let currentQuiz = 1;

    function checkAnswer() {
      const quiz = document.getElementById(`quiz${currentQuiz}`);
      const selected = quiz.querySelector('input[type="radio"]:checked');
      const result = document.getElementById('result');

      if (selected && selected.value === 'correct') {
        result.innerText = 'Correct! 🌟';
        quiz.style.display = 'none';
        currentQuiz++;
        const nextQuiz = document.getElementById(`quiz${currentQuiz}`);
        if (nextQuiz) {
          nextQuiz.style.display = 'block';
        } else {
          result.innerText = 'Well done! You completed the quiz! 🎉';
        }
      } else {
        result.innerText = 'Oops, try again!';
      }
    }