import '@testing-library/jest-dom';
import {render, waitFor, screen, fireEvent} from '@testing-library/vue';
import QuizProfile from './QuizProfile.vue';
import {createStore} from 'vuex';

jest.mock('vue-i18n', () => ({
  __esModule: true,
  useI18n: jest.fn(() => ({
    t: (str) => str,
  })),
  createI18n: jest.fn().mockReturnValue({
    t: key => key,
  }),
}));

jest.mock('@/i18n/index', () => ({
  global: {
    locale: {
      value: 'en',
    },
    t: (str) => str
  },
}));

jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => ({
    params: {
      id: 1,
      quizId: 1,
    },
  })),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('@/services/quizzes.service', () => ({
  getQuizById: jest.fn(async (quizId) => ({
    data: {
      id: quizId,
      title: 'Quiz Title',
      description: 'Quiz Description',
      frequency: 1,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
      company: 1,
    },
  })),
}));

jest.mock('@/http/axios/apiClient', () => ({
  get: jest.fn(() => Promise.resolve({
    data: {
      administrators: [1],
      owner: 1,
    },
  })),
  delete: jest.fn(() => Promise.resolve()),
  patch: jest.fn(() => Promise.resolve()),
}));

const store = createStore({
  state: {
    auth: {
      user: {
        id: 1
      },
    },
  },
});

describe('QuizProfile component', () => {
  const customRender = (component, options = {}) => {
    return render(component, {
      global: {
        mocks: {
          $t: (key) => key,
        },
        provide: {
          store: store,
        },
        ...options,
      },
    });
  };

  test('Renders QuizProfile component', async () => {
    customRender(QuizProfile);
    waitFor(() => {
      expect(screen.getByText('Quiz Title')).toBeInTheDocument();
      expect(screen.getByText('Quiz Description')).toBeInTheDocument();
      expect(screen.getByText('company_profile.update_quiz')).toBeInTheDocument();
    })
  })

  test('Clicking "Update Quiz" button triggers update and shows success toast', async () => {
    customRender(QuizProfile);

    await waitFor(() => {
      fireEvent.click(screen.getAllByText('company_profile.update_quiz')[0]);
    });

    waitFor(() => {
      expect(screen.getByText('company_profile.quiz_update_success')).toBeInTheDocument();
    });
  });

  test('Clicking "Add Question" button triggers question creation and shows success toast', async () => {
    customRender(QuizProfile);

    await waitFor(() => {
      fireEvent.click(screen.getAllByText('company_profile.add_question')[0]);
    });

    waitFor(() => {
      expect(screen.getByText('Question created successfully')).toBeInTheDocument();
    });
  });

  test('Delete the quiz', async () => {
    customRender(QuizProfile)

    await waitFor(() => {
      fireEvent.click(screen.getAllByText('company_profile.delete_quiz')[0]);
    });

    await waitFor(() => {
      fireEvent.click(screen.getAllByText('company_profile.delete_quiz')[2]);
    })
  })

  test('Non-owner and non-admin users cannot access delete and update buttons', async () => {
    store.state.auth.user.id = 3;
    customRender(QuizProfile);

    await waitFor(() => {});

    expect(screen.queryByText('company_profile.update_quiz')).toBeNull();
    expect(screen.queryByText('company_profile.delete_quiz')).toBeNull();
  });
})

