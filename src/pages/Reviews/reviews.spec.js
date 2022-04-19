import Review from './index';

describe('<Reviews />', () => {
  let component;

  beforeEach(() => {
    component = shallow(<Review />);
  });

  it('should not render when language is not ready', async () => {
    expect(component.find('CheckableTag').exists()).to.be.false;
    component.setProps({ lang: {} });
    expect(component.find('CheckableTag').exists()).to.be.true;
  });
});

