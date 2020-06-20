import unittest
from unittest.mock import patch, mock_open, call

import pathlib
import sys

sys.path.insert(0, pathlib.Path(__file__).parent.absolute())
from src.nztm_to_geod import NztmToGeod


class TestNztmToGeod(unittest.TestCase):

    def test_nztm_to_geod_conversion(self):
        converter = NztmToGeod("aFile", "anotherFile")
        lat, long = converter.to_lat_long(1749111.6867, 5428899.4356)
        assert -41.277580629750105 == lat
        assert 174.78044908304847 == long

    @patch('builtins.open', new_callable=mock_open, read_data="""
        X,Y,system_id,meter,purpose,orientation,on_off_road,road_id,street_address,asset_owner,OBJECTID,GlobalID
        1749111.6867,5428899.4356,9912,Yes,Regular,Parallel,On Road,THORNDON QUAY,,Local Authority,9897,41374858-a0c9-4df0-a5d3-7c2bfd2e2fd9
        1748838.7773,5428674.014,9913,Yes,Regular,Parallel,On Road,WHITMORE ST,,Local Authority,9898,d93f302b-67bc-4ffa-9094-8f298b356f40
        1753794.1441,5442043.332399999723,2539,No,Disabled,Parallel,On Road,HINAU ST,,Local Authority,2524,63c9aa29-b6cf-411b-90c5-79a5cd3140a7""")
    def test_nztm_to_geod_file_conversion(self, mocked_open):
        converter = NztmToGeod("source", "target")
        converter.convert_file_to_lat_long()
        mocked_open.assert_has_calls([call('source', newline=""), call('target', 'w')], any_order=True)
        mocked_open.assert_has_calls([
            call().write("41374858-a0c9-4df0-a5d3-7c2bfd2e2fd9,Regular,-41.277580629750105,174.78044908304847\n"),
            call().write("d93f302b-67bc-4ffa-9094-8f298b356f40,Regular,-41.27966054589228,174.77724701973978\n"),
            call().write("63c9aa29-b6cf-411b-90c5-79a5cd3140a7,Disabled,-41.158364486692776,174.8330243908878\n")], any_order=False)


if __name__ == '__main__':
    unittest.main()

