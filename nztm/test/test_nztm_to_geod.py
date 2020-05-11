import unittest
from unittest.mock import patch, mock_open, call

from ..src.nztm_to_geod import NztmToGeod


class TestNztmToGeod(unittest.TestCase):

    def test_nztm_to_geod_conversion(self):
        converter = NztmToGeod("aFile", "anotherFile")
        lat, long = converter.to_lat_long(1749111.6867, 5428899.4356)
        assert -41.277580629750105 == lat
        assert 174.78044908304847 == long

    @patch('builtins.open', new_callable=mock_open, read_data="""X,Y,system_id
        1749111.6867,5428899.4356,9912
        1748838.7773,5428674.014,9913""")
    def test_nztm_to_geod_file_conversion(self, mocked_open):
        converter = NztmToGeod("source", "target")
        converter.convert_file_to_lat_long()
        mocked_open.assert_has_calls([call('source', newline=""), call('target', 'w')], any_order=True)
        mocked_open.assert_has_calls([
            call().write("9912, -41.277580629750105, 174.78044908304847\n"),
            call().write("9913, -41.27966054589228, 174.77724701973978\n")], any_order=False)


if __name__ == '__main__':
    unittest.main()

