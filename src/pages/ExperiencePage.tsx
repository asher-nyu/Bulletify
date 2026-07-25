import ConverterPage from '../components/ConverterPage';
import { convertText } from '../convertText';

export default function ExperiencePage() {
  return <ConverterPage convert={convertText} label="Experience" page="experience" />;
}
